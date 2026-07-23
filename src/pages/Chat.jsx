import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import CallModal from "../components/CallModal";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useLanguage } from "../context/LanguageContext";
import { getAllUsersApi } from "../api/userApi";
import {
  getConversationsApi,
  getConversationHistoryApi,
  sendImageMessageApi,
  deleteMessageApi,
} from "../api/chatApi";
import { getContactsApi, saveContactApi, removeContactApi } from "../api/contactApi";

const IMAGE_BASE_URL = "http://localhost:4000/public";
const STUN_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
const EMOJIS = ["😀", "😂", "😍", "👍", "🙏", "🔥", "🎉", "😢", "😮", "❤️", "👏", "🤔"];

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const UserRow = ({ person, active, onClick, subtitle, isOnline, rightSlot }) => (
  <div
    className={`d-flex align-items-center gap-1 rounded-3 mb-1 px-2 py-2 ${active ? "bg-light" : ""}`}
  >
    <button
      onClick={onClick}
      className="btn p-0 border-0 d-flex align-items-center gap-2 flex-grow-1 text-start"
      style={{ minWidth: 0 }}
    >
      <div className="position-relative flex-shrink-0">
        <div
          className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white overflow-hidden"
          style={{ width: "40px", height: "40px" }}
        >
          {person.profilePicture ? (
            <img
              src={`${IMAGE_BASE_URL}/${person.profilePicture}`}
              alt="avatar"
              className="w-100 h-100"
              style={{ objectFit: "cover" }}
            />
          ) : (
            person.firstname ? person.firstname[0].toUpperCase() : "U"
          )}
        </div>
        {isOnline && (
          <span
            className="position-absolute rounded-circle bg-success border border-2 border-white"
            style={{ width: "11px", height: "11px", bottom: 0, right: 0 }}
          ></span>
        )}
      </div>
      <div className="flex-grow-1 overflow-hidden">
        <p className="mb-0 small fw-medium text-truncate">
          {person.firstname} {person.lastname}
        </p>
        {subtitle && (
          <p className="mb-0 small text-secondary text-truncate">{subtitle}</p>
        )}
      </div>
    </button>
    {rightSlot}
  </div>
);

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();
  const { t } = useLanguage();

  const [allUsers, setAllUsers] = useState([]);
  const [contacts, setContacts] = useState([]); // [{_id, contact:{...}}]
  const [conversations, setConversations] = useState([]); // [{userId, lastMessage, createdAt}]
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [leftSearchTerm, setLeftSearchTerm] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Qo'ng'iroq holati
  const [callState, setCallState] = useState(null); // 'calling' | 'incoming' | 'active' | null
  const [callType, setCallType] = useState("voice");
  const [incomingData, setIncomingData] = useState(null);
  const [callPersonInfo, setCallPersonInfo] = useState(null);

  const messagesEndRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const otherUserIdRef = useRef(null);
  const callStateRef = useRef(null);

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  // Boshlang'ich ma'lumotlarni yuklash
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setLoading(true);
        const [usersRes, contactsRes, convRes] = await Promise.all([
          getAllUsersApi(),
          getContactsApi(),
          getConversationsApi(),
        ]);
        setAllUsers(usersRes.data.users.filter((u) => u._id !== user._id));
        setContacts(contactsRes.data.contacts);
        setConversations(convRes.data.conversations);

        if (userId) {
          const target = usersRes.data.users.find((u) => u._id === userId);
          if (target) setSelectedUser(target);
        }
      } catch (error) {
        console.error("Chatni yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, [user._id, userId]);

  // Tanlangan odam o'zgarganda, suhbat tarixini yuklaymiz va "ko'rildi" deb belgilaymiz
  useEffect(() => {
    if (!selectedUser) return;

    const fetchHistory = async () => {
      try {
        const res = await getConversationHistoryApi(selectedUser._id);
        setMessages(res.data.messages);
        if (socket) {
          socket.emit("markSeen", { viewerId: user._id, otherUserId: selectedUser._id });
        }
      } catch (error) {
        console.error("Suhbat tarixini yuklashda xatolik:", error);
      }
    };

    fetchHistory();
  }, [selectedUser]);

  const updateConversationPreview = (otherUserId, previewText) => {
    setConversations((prev) => {
      const exists = prev.find((c) => c.userId === otherUserId);
      const updated = exists
        ? prev.map((c) =>
            c.userId === otherUserId
              ? { ...c, lastMessage: previewText, createdAt: new Date().toISOString() }
              : c
          )
        : [
            { userId: otherUserId, lastMessage: previewText, createdAt: new Date().toISOString() },
            ...prev,
          ];
      return updated;
    });
  };

  // Real vaqtdagi xabar hodisalari
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (message) => {
      if (selectedUser && message.sender === selectedUser._id) {
        setMessages((prev) => [...prev, message]);
        socket.emit("markSeen", { viewerId: user._id, otherUserId: selectedUser._id });
      }
      const preview = message.imageUrl ? `📷 ${t("send_image")}` : message.text;
      updateConversationPreview(message.sender, preview);
    };

    const handleSentAck = (savedMessage) => {
      setMessages((prev) => {
        const revIdx = [...prev]
          .reverse()
          .findIndex((m) => !m._id && m.sender === user._id && m.text === savedMessage.text);
        if (revIdx === -1) return prev;
        const realIdx = prev.length - 1 - revIdx;
        const copy = [...prev];
        copy[realIdx] = savedMessage;
        return copy;
      });
    };

    const handleDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    const handleSeen = ({ by }) => {
      if (selectedUser && by === selectedUser._id) {
        setMessages((prev) =>
          prev.map((m) => (m.sender === user._id ? { ...m, seen: true } : m))
        );
      }
    };

    socket.on("getMessage", handleIncoming);
    socket.on("messageSent", handleSentAck);
    socket.on("messageDeleted", handleDeleted);
    socket.on("messagesSeen", handleSeen);

    return () => {
      socket.off("getMessage", handleIncoming);
      socket.off("messageSent", handleSentAck);
      socket.off("messageDeleted", handleDeleted);
      socket.off("messagesSeen", handleSeen);
    };
  }, [socket, selectedUser]);

  // --- Qo'ng'iroq (WebRTC) hodisalari ---
  const cleanupCall = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((tr) => tr.stop());
      localStreamRef.current = null;
    }
    otherUserIdRef.current = null;
    setIncomingData(null);
    setCallState(null);
  };

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data) => {
      if (callStateRef.current) {
        socket.emit("rejectCall", { to: data.from });
        return;
      }
      setIncomingData(data);
      setCallType(data.callType);
      setCallPersonInfo(data.callerInfo);
      setCallState("incoming");
    };

    const handleCallAccepted = async ({ answer }) => {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setCallState("active");
      }
    };

    const handleCallRejected = () => {
      alert(t("call_rejected"));
      cleanupCall();
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (pcRef.current && candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("ICE candidate xatosi:", error);
        }
      }
    };

    const handleCallEnded = () => {
      cleanupCall();
    };

    const handleCallFailed = () => {
      alert(t("call_offline"));
      cleanupCall();
    };

    socket.on("incomingCall", handleIncomingCall);
    socket.on("callAccepted", handleCallAccepted);
    socket.on("callRejected", handleCallRejected);
    socket.on("iceCandidate", handleIceCandidate);
    socket.on("callEnded", handleCallEnded);
    socket.on("callFailed", handleCallFailed);

    return () => {
      socket.off("incomingCall", handleIncomingCall);
      socket.off("callAccepted", handleCallAccepted);
      socket.off("callRejected", handleCallRejected);
      socket.off("iceCandidate", handleIceCandidate);
      socket.off("callEnded", handleCallEnded);
      socket.off("callFailed", handleCallFailed);
    };
  }, [socket]);

  const createPeerConnection = (targetUserId) => {
    const pc = new RTCPeerConnection(STUN_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("iceCandidate", { to: targetUserId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pcRef.current = pc;
    return pc;
  };

  const startCall = async (type) => {
    if (!selectedUser || !socket) return;
    if (!isUserOnline(selectedUser._id)) {
      alert(t("call_offline"));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      otherUserIdRef.current = selectedUser._id;
      const pc = createPeerConnection(selectedUser._id);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("callUser", {
        to: selectedUser._id,
        from: user._id,
        offer,
        callType: type,
        callerInfo: {
          firstname: user.firstname,
          lastname: user.lastname,
          profilePicture: user.profilePicture,
        },
      });

      setCallType(type);
      setCallPersonInfo(selectedUser);
      setCallState("calling");
    } catch (error) {
      console.error("Qo'ng'iroqni boshlashda xatolik:", error);
    }
  };

  const acceptCall = async () => {
    if (!incomingData) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: incomingData.callType === "video",
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      otherUserIdRef.current = incomingData.from;
      const pc = createPeerConnection(incomingData.from);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingData.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answerCall", { to: incomingData.from, answer });
      setCallState("active");
    } catch (error) {
      console.error("Qo'ng'iroqni qabul qilishda xatolik:", error);
    }
  };

  const rejectCall = () => {
    if (incomingData && socket) {
      socket.emit("rejectCall", { to: incomingData.from });
    }
    cleanupCall();
  };

  const endCall = () => {
    if (otherUserIdRef.current && socket) {
      socket.emit("endCall", { to: otherUserIdRef.current });
    }
    cleanupCall();
  };

  // Har yangi xabarda pastga aylantirish
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectUser = (person) => {
    setSelectedUser(person);
    setShowEmoji(false);
    navigate(`/chat/${person._id}`);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (text.trim() === "" || !selectedUser || !socket) return;

    const messageData = {
      senderId: user._id,
      receiverId: selectedUser._id,
      text: text.trim(),
    };

    socket.emit("sendMessage", messageData);

    setMessages((prev) => [
      ...prev,
      {
        sender: user._id,
        receiver: selectedUser._id,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        seen: false,
      },
    ]);

    updateConversationPreview(selectedUser._id, text.trim());
    setText("");
    setShowEmoji(false);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("receiverId", selectedUser._id);
      const res = await sendImageMessageApi(formData);
      setMessages((prev) => [...prev, res.data.data]);
      updateConversationPreview(selectedUser._id, `📷 ${t("send_image")}`);
    } catch (error) {
      console.error("Rasm yuborishda xatolik:", error);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm(t("confirm_delete_message"))) return;
    try {
      await deleteMessageApi(messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (error) {
      console.error("Xabarni o'chirishda xatolik:", error);
    }
  };

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
  };

  const isContact = (personId) => contacts.some((c) => c.contact._id === personId);

  const toggleContact = async (person) => {
    try {
      if (isContact(person._id)) {
        await removeContactApi(person._id);
        setContacts((prev) => prev.filter((c) => c.contact._id !== person._id));
      } else {
        const res = await saveContactApi(person._id);
        setContacts((prev) => [res.data.contact, ...prev]);
      }
    } catch (error) {
      console.error("Kontakt bilan ishlashda xatolik:", error);
    }
  };

  const handleRemoveContact = async (personId) => {
    try {
      await removeContactApi(personId);
      setContacts((prev) => prev.filter((c) => c.contact._id !== personId));
    } catch (error) {
      console.error("Kontaktni o'chirishda xatolik:", error);
    }
  };

  const filteredAllUsers = leftSearchTerm.trim()
    ? allUsers.filter((u) => {
        const full = `${u.firstname} ${u.lastname} ${u.username}`.toLowerCase();
        return full.includes(leftSearchTerm.toLowerCase());
      })
    : allUsers;

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1" style={{ marginLeft: "64px" }}>
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="d-flex flex-grow-1" style={{ height: "100vh", marginLeft: "64px" }}>
        {/* Chap panel — qidiruv + barcha foydalanuvchilar */}
        <div className="border-end d-flex flex-column" style={{ width: "260px", flexShrink: 0 }}>
          <div className="p-3 border-bottom">
            <div className="d-flex align-items-center gap-2 bg-light rounded-pill px-3 py-2">
              <i className="bi bi-search text-secondary"></i>
              <input
                type="text"
                className="form-control border-0 bg-transparent shadow-none p-0"
                placeholder={t("chat_search_placeholder")}
                value={leftSearchTerm}
                onChange={(e) => setLeftSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <p className="text-secondary small px-3 mt-2 mb-1">{t("chat_all_users")}</p>
          <div className="flex-grow-1 overflow-auto px-2">
            {filteredAllUsers.map((person) => (
              <UserRow
                key={person._id}
                person={person}
                active={selectedUser?._id === person._id}
                isOnline={isUserOnline(person._id)}
                onClick={() => handleSelectUser(person)}
                rightSlot={
                  <button
                    className="btn btn-sm p-0 text-secondary flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleContact(person);
                    }}
                    title={isContact(person._id) ? t("remove_contact") : t("save_contact")}
                  >
                    <i
                      className={`bi ${
                        isContact(person._id) ? "bi-bookmark-fill text-danger" : "bi-bookmark"
                      }`}
                    ></i>
                  </button>
                }
              />
            ))}
          </div>
        </div>

        {/* O'rta panel — tanlangan suhbat */}
        <div className="flex-grow-1 d-flex flex-column position-relative">
          {!selectedUser ? (
            <div className="d-flex flex-grow-1 align-items-center justify-content-center text-secondary">
              {t("chat_no_conversation")}
            </div>
          ) : (
            <>
              <div className="p-3 border-bottom d-flex align-items-center gap-2">
                <div className="position-relative flex-shrink-0">
                  <div
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white overflow-hidden"
                    style={{ width: "36px", height: "36px" }}
                  >
                    {selectedUser.profilePicture ? (
                      <img
                        src={`${IMAGE_BASE_URL}/${selectedUser.profilePicture}`}
                        alt="avatar"
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      selectedUser.firstname ? selectedUser.firstname[0].toUpperCase() : "U"
                    )}
                  </div>
                  {isUserOnline(selectedUser._id) && (
                    <span
                      className="position-absolute rounded-circle bg-success border border-2 border-white"
                      style={{ width: "10px", height: "10px", bottom: 0, right: 0 }}
                    ></span>
                  )}
                </div>
                <div className="flex-grow-1">
                  <span className="fw-medium d-block">
                    {selectedUser.firstname} {selectedUser.lastname}
                  </span>
                  <span className="text-secondary small">
                    {isUserOnline(selectedUser._id) ? t("online") : t("offline")}
                  </span>
                </div>
                <button
                  className="btn btn-light rounded-circle flex-shrink-0"
                  style={{ width: "38px", height: "38px" }}
                  onClick={() => startCall("voice")}
                  title={t("voice_call")}
                >
                  <i className="bi bi-telephone"></i>
                </button>
                <button
                  className="btn btn-light rounded-circle flex-shrink-0"
                  style={{ width: "38px", height: "38px" }}
                  onClick={() => startCall("video")}
                  title={t("video_call")}
                >
                  <i className="bi bi-camera-video"></i>
                </button>
              </div>

              <div className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-2">
                {messages.map((m, idx) => {
                  const isMine = m.sender === user._id;
                  return (
                    <div
                      key={m._id || idx}
                      className={`d-flex ${isMine ? "justify-content-end" : "justify-content-start"}`}
                    >
                      <div className="d-flex align-items-end gap-1" style={{ maxWidth: "70%" }}>
                        {isMine && m._id && (
                          <button
                            className="btn btn-sm p-0 text-secondary"
                            style={{ fontSize: "12px" }}
                            onClick={() => handleDeleteMessage(m._id)}
                            title={t("delete_message")}
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        )}
                        <div>
                          <div
                            className={`px-3 py-2 rounded-4 ${
                              isMine ? "bg-danger text-white" : "bg-light text-dark"
                            }`}
                          >
                            {m.imageUrl && (
                              <img
                                src={`${IMAGE_BASE_URL}/${m.imageUrl}`}
                                alt="attachment"
                                className="rounded-3 mb-1 d-block"
                                style={{ maxWidth: "220px", maxHeight: "220px", objectFit: "cover" }}
                              />
                            )}
                            {m.text && <p className="mb-0 small">{m.text}</p>}
                          </div>
                          <div
                            className={`d-flex align-items-center gap-1 mt-1 ${
                              isMine ? "justify-content-end" : ""
                            }`}
                          >
                            <span className="text-secondary" style={{ fontSize: "11px" }}>
                              {formatTime(m.createdAt)}
                            </span>
                            {isMine && (
                              <i
                                className={`bi ${
                                  m.seen ? "bi-check2-all text-primary" : "bi-check2"
                                }`}
                                style={{ fontSize: "12px" }}
                              ></i>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef}></div>
              </div>

              <div className="position-relative">
                {showEmoji && (
                  <div
                    className="position-absolute bg-white border rounded-3 shadow p-2 d-flex flex-wrap"
                    style={{ bottom: "56px", left: "16px", width: "230px", gap: "4px", zIndex: 20 }}
                  >
                    {EMOJIS.map((emo) => (
                      <button
                        key={emo}
                        type="button"
                        className="btn btn-sm p-1 border-0"
                        style={{ fontSize: "18px" }}
                        onClick={() => handleEmojiClick(emo)}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSend} className="p-3 border-top d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-circle flex-shrink-0"
                    style={{ width: "38px", height: "38px" }}
                    onClick={() => setShowEmoji((v) => !v)}
                    title="Emoji"
                  >
                    <i className="bi bi-emoji-smile"></i>
                  </button>

                  <label
                    className="btn btn-light rounded-circle flex-shrink-0 mb-0 d-flex align-items-center justify-content-center"
                    style={{ width: "38px", height: "38px" }}
                    title={t("send_image")}
                  >
                    {uploadingImage ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        style={{ width: "14px", height: "14px" }}
                      ></span>
                    ) : (
                      <i className="bi bi-image"></i>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={handleImageChange}
                    />
                  </label>

                  <input
                    type="text"
                    className="form-control rounded-pill"
                    placeholder={t("chat_write_message")}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <button
                    className="btn btn-danger rounded-circle flex-shrink-0"
                    type="submit"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <i className="bi bi-send"></i>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* O'ng panel — saqlangan kontaktlar */}
        <div className="border-start d-flex flex-column" style={{ width: "260px", flexShrink: 0 }}>
          <p className="text-secondary small px-3 pt-3 mb-1">{t("chat_contacts")}</p>
          <div className="flex-grow-1 overflow-auto px-2">
            {contacts.length === 0 ? (
              <p className="text-secondary small px-2">{t("chat_no_contacts")}</p>
            ) : (
              contacts.map((c) => {
                const person = c.contact;
                if (!person) return null;
                const conv = conversations.find((cv) => cv.userId === person._id);
                return (
                  <UserRow
                    key={c._id}
                    person={person}
                    active={selectedUser?._id === person._id}
                    isOnline={isUserOnline(person._id)}
                    subtitle={conv?.lastMessage}
                    onClick={() => handleSelectUser(person)}
                    rightSlot={
                      <button
                        className="btn btn-sm p-0 text-secondary flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveContact(person._id);
                        }}
                        title={t("remove_contact")}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    }
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      <CallModal
        callState={callState}
        callType={callType}
        personInfo={callPersonInfo}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        onAccept={acceptCall}
        onReject={rejectCall}
        onEnd={endCall}
      />
    </div>
  );
};

export default Chat;
