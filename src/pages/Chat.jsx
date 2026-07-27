import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import CallModal from "../components/CallModal";
import UserProfileModal from "../components/UserProfileModal";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useLanguage } from "../context/LanguageContext";
import { getAllUsersApi, getOneUserApi, blockUserApi, unblockUserApi, deleteUserApi } from "../api/userApi";
import {
  getConversationsApi,
  getConversationHistoryApi,
  sendImageMessageApi,
  deleteMessageApi,
  updateMessageApi,
} from "../api/chatApi";
import { getContactsApi, saveContactApi, removeContactApi, updateNicknameApi } from "../api/contactApi";

const IMAGE_BASE_URL = "http://localhost:4000/public";
const STUN_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
const EMOJIS = ["😀", "😂", "😍", "👍", "🙏", "🔥", "🎉", "😢", "😮", "❤️", "👏", "🤔"];

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const UserRow = ({ person, active, onClick, subtitle, isOnline, rightSlot, displayName }) => (
  <div
    className={`d-flex align-items-center gap-1 rounded-3 mb-1 px-2 py-2 chat-user-row ${
      active ? "chat-user-row-active" : ""
    }`}
  >
    <button
      onClick={onClick}
      className="btn p-0 border-0 d-flex align-items-center gap-2 flex-grow-1 text-start"
      style={{ minWidth: 0 }}
    >
      <div className="position-relative flex-shrink-0">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center text-white overflow-hidden"
          style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(135deg, #6c757d, #495057)",
          }}
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
          {displayName || `${person.firstname} ${person.lastname}`}
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
  const { user, updateUser, logout } = useAuth();
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
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // Qo'ng'iroq holati
  const [callState, setCallState] = useState(null); // 'calling' | 'incoming' | 'active' | null
  const [callType, setCallType] = useState("voice");
  const [incomingData, setIncomingData] = useState(null);
  const [callPersonInfo, setCallPersonInfo] = useState(null);

  // Foydalanuvchi profil oynasi (Telegram uslubida)
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profilePerson, setProfilePerson] = useState(null);

  // Chap panel tagidagi "mening akkauntim" popupi
  const [showMyAccountMenu, setShowMyAccountMenu] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

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

    const handleUpdated = (updatedMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m))
      );
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
    socket.on("messageUpdated", handleUpdated);
    socket.on("messagesSeen", handleSeen);

    return () => {
      socket.off("getMessage", handleIncoming);
      socket.off("messageSent", handleSentAck);
      socket.off("messageDeleted", handleDeleted);
      socket.off("messageUpdated", handleUpdated);
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

  const startCall = async (type, targetPerson) => {
    const callTarget = targetPerson || selectedUser;
    if (!callTarget || !socket) return;
    if (!isUserOnline(callTarget._id)) {
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

      otherUserIdRef.current = callTarget._id;
      const pc = createPeerConnection(callTarget._id);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("callUser", {
        to: callTarget._id,
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
      setCallPersonInfo(callTarget);
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

  const startEditMessage = (message) => {
    setEditingMessageId(message._id);
    setEditingText(message.text || "");
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleSaveEditMessage = async (e, messageId) => {
    e.preventDefault();
    if (editingText.trim() === "") return;
    try {
      const res = await updateMessageApi(messageId, editingText.trim());
      setMessages((prev) => prev.map((m) => (m._id === messageId ? res.data.data : m)));
      cancelEditMessage();
    } catch (error) {
      console.error("Xabarni tahrirlashda xatolik:", error);
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDeleteMyAccount = async () => {
    if (!window.confirm(t("confirm_delete_account"))) return;
    try {
      setDeletingAccount(true);
      await deleteUserApi(user._id);
      logout();
      navigate("/");
    } catch (error) {
      console.error("Akkauntni o'chirishda xatolik:", error);
    } finally {
      setDeletingAccount(false);
    }
  };

  const isBlockedByMe = (personId) =>
    (user.blockedUsers || []).some((id) => id === personId || id?._id === personId);

  const openProfileModal = async (person) => {
    try {
      const res = await getOneUserApi(person._id);
      setProfilePerson(res.data.user);
    } catch (error) {
      setProfilePerson(person);
    }
    setShowProfileModal(true);
  };

  const handleToggleBlock = async (personId) => {
    try {
      if (isBlockedByMe(personId)) {
        await unblockUserApi(personId);
        const updatedList = (user.blockedUsers || []).filter(
          (id) => id !== personId && id?._id !== personId
        );
        updateUser({ ...user, blockedUsers: updatedList });
      } else {
        await blockUserApi(personId);
        updateUser({ ...user, blockedUsers: [...(user.blockedUsers || []), personId] });
      }
    } catch (error) {
      console.error("Bloklashda xatolik:", error);
    }
  };

  const getContactRecord = (personId) => contacts.find((c) => c.contact._id === personId);

  const handleSaveNickname = async (personId, nickname) => {
    try {
      const res = await updateNicknameApi(personId, nickname);
      setContacts((prev) => prev.map((c) => (c._id === res.data.contact._id ? res.data.contact : c)));
    } catch (error) {
      console.error("Taxallusni saqlashda xatolik:", error);
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
                displayName={getContactRecord(person._id)?.nickname}
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

          {/* Mening akkauntim — profilga tezkor kirish */}
          <div className="border-top p-2 position-relative">
            {showMyAccountMenu && (
              <>
                <div
                  className="position-fixed top-0 start-0 w-100 h-100"
                  style={{ zIndex: 40 }}
                  onClick={() => setShowMyAccountMenu(false)}
                ></div>
                <div
                  className="position-absolute bg-white rounded-3 shadow border py-1"
                  style={{ left: "8px", bottom: "56px", width: "220px", zIndex: 41 }}
                >
                  <button
                    className="btn btn-sm w-100 text-start px-3 py-2 border-0"
                    onClick={() => {
                      setShowMyAccountMenu(false);
                      navigate(`/profile/${user._id}`);
                    }}
                  >
                    <i className="bi bi-person me-2"></i>
                    {t("view_profile")}
                  </button>
                  <button
                    className="btn btn-sm w-100 text-start px-3 py-2 border-0"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    {t("log_out")}
                  </button>
                  <button
                    className="btn btn-sm w-100 text-start px-3 py-2 border-0 text-danger"
                    onClick={handleDeleteMyAccount}
                    disabled={deletingAccount}
                  >
                    <i className="bi bi-trash3 me-2"></i>
                    {deletingAccount ? t("deleting_account") : t("delete_account")}
                  </button>
                </div>
              </>
            )}

            <button
              className="btn p-0 border-0 d-flex align-items-center gap-2 w-100 text-start rounded-3 px-2 py-2"
              onClick={() => setShowMyAccountMenu((v) => !v)}
            >
              <div
                className="rounded-circle bg-success d-flex align-items-center justify-content-center text-white overflow-hidden flex-shrink-0"
                style={{ width: "36px", height: "36px" }}
              >
                {user.profilePicture ? (
                  <img
                    src={`${IMAGE_BASE_URL}/${user.profilePicture}`}
                    alt="avatar"
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  user.firstname ? user.firstname[0].toUpperCase() : "U"
                )}
              </div>
              <div className="flex-grow-1 overflow-hidden">
                <p className="mb-0 small fw-medium text-truncate">
                  {user.firstname} {user.lastname}
                </p>
                <p className="mb-0 text-secondary text-truncate" style={{ fontSize: "11px" }}>
                  @{user.username}
                </p>
              </div>
              <i className="bi bi-chevron-up text-secondary small"></i>
            </button>
          </div>
        </div>

        {/* O'rta panel — tanlangan suhbat */}
        <div className="flex-grow-1 d-flex flex-column position-relative">
          {!selectedUser ? (
            <div className="d-flex flex-grow-1 flex-column align-items-center justify-content-center text-center px-3">
              <div
                className="rounded-circle bg-success d-flex align-items-center justify-content-center text-white overflow-hidden mb-3"
                style={{ width: "96px", height: "96px", fontSize: "36px" }}
              >
                {user.profilePicture ? (
                  <img
                    src={`${IMAGE_BASE_URL}/${user.profilePicture}`}
                    alt="avatar"
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  user.firstname ? user.firstname[0].toUpperCase() : "U"
                )}
              </div>
              <h5 className="mb-1">
                {user.firstname} {user.lastname}
              </h5>
              <p className="text-secondary small mb-3">@{user.username}</p>
              <button
                className="btn btn-outline-dark rounded-pill btn-sm mb-4"
                onClick={() => navigate(`/profile/${user._id}`)}
              >
                {t("view_profile")}
              </button>
              <p className="text-secondary">{t("chat_no_conversation")}</p>
            </div>
          ) : (
            <>
              <div className="p-3 border-bottom d-flex align-items-center gap-2 chat-header">
                <button
                  className="btn p-0 border-0 d-flex align-items-center gap-2 flex-grow-1 text-start"
                  onClick={() => openProfileModal(selectedUser)}
                  style={{ minWidth: 0 }}
                >
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
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <span className="fw-medium d-block text-truncate">
                      {getContactRecord(selectedUser._id)?.nickname ||
                        `${selectedUser.firstname} ${selectedUser.lastname}`}
                    </span>
                    <span className="text-secondary small">
                      {isUserOnline(selectedUser._id) ? t("online") : t("offline")}
                    </span>
                  </div>
                </button>
                <button
                  className="btn btn-light rounded-circle flex-shrink-0"
                  style={{ width: "38px", height: "38px" }}
                  onClick={() => startCall("voice")}
                  title={t("voice_call")}
                  disabled={isBlockedByMe(selectedUser._id)}
                >
                  <i className="bi bi-telephone"></i>
                </button>
                <button
                  className="btn btn-light rounded-circle flex-shrink-0"
                  style={{ width: "38px", height: "38px" }}
                  onClick={() => startCall("video")}
                  title={t("video_call")}
                  disabled={isBlockedByMe(selectedUser._id)}
                >
                  <i className="bi bi-camera-video"></i>
                </button>
              </div>

              {isBlockedByMe(selectedUser._id) && (
                <div className="alert alert-secondary rounded-0 mb-0 text-center small py-2">
                  {t("blocked_message")}
                </div>
              )}

              <div
                className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-2 chat-messages-area"
              >
                {messages.map((m, idx) => {
                  const isMine = m.sender === user._id;
                  const isEditing = editingMessageId === m._id;
                  return (
                    <div
                      key={m._id || idx}
                      className={`d-flex ${isMine ? "justify-content-end" : "justify-content-start"}`}
                    >
                      <div className="d-flex align-items-end gap-1 chat-message-wrapper" style={{ maxWidth: "70%" }}>
                        {isMine && m._id && !isEditing && (
                          <div className="d-flex gap-1 message-actions">
                            {!m.imageUrl && (
                              <button
                                className="btn btn-sm p-0 text-secondary"
                                style={{ fontSize: "12px" }}
                                onClick={() => startEditMessage(m)}
                                title={t("edit_message")}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                            )}
                            <button
                              className="btn btn-sm p-0 text-secondary"
                              style={{ fontSize: "12px" }}
                              onClick={() => handleDeleteMessage(m._id)}
                              title={t("delete_message")}
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                          </div>
                        )}
                        <div>
                          {isEditing ? (
                            <form
                              onSubmit={(e) => handleSaveEditMessage(e, m._id)}
                              className="d-flex gap-1"
                              style={{ minWidth: "220px" }}
                            >
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                autoFocus
                              />
                              <button className="btn btn-danger btn-sm flex-shrink-0" type="submit">
                                <i className="bi bi-check-lg"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-light btn-sm flex-shrink-0"
                                onClick={cancelEditMessage}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </form>
                          ) : (
                            <div
                              className={`px-3 py-2 chat-bubble ${
                                isMine ? "chat-bubble-mine" : "chat-bubble-other"
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
                          )}
                          {!isEditing && (
                            <div
                              className={`d-flex align-items-center gap-1 mt-1 ${
                                isMine ? "justify-content-end" : ""
                              }`}
                            >
                              {m.edited && (
                                <span className="text-secondary" style={{ fontSize: "10px" }}>
                                  {t("edited_label")}
                                </span>
                              )}
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
                          )}
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
                    disabled={isBlockedByMe(selectedUser._id)}
                  >
                    <i className="bi bi-emoji-smile"></i>
                  </button>

                  <label
                    className="btn btn-light rounded-circle flex-shrink-0 mb-0 d-flex align-items-center justify-content-center"
                    style={{
                      width: "38px",
                      height: "38px",
                      opacity: isBlockedByMe(selectedUser._id) ? 0.5 : 1,
                      pointerEvents: isBlockedByMe(selectedUser._id) ? "none" : "auto",
                    }}
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
                      disabled={isBlockedByMe(selectedUser._id)}
                    />
                  </label>

                  <input
                    type="text"
                    className="form-control rounded-pill"
                    placeholder={t("chat_write_message")}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isBlockedByMe(selectedUser._id)}
                  />
                  <button
                    className="btn btn-danger rounded-circle flex-shrink-0"
                    type="submit"
                    style={{ width: "40px", height: "40px" }}
                    disabled={isBlockedByMe(selectedUser._id)}
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
                    displayName={c.nickname}
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

      {showProfileModal && profilePerson && (
        <UserProfileModal
          person={profilePerson}
          isOnline={isUserOnline(profilePerson._id)}
          isContact={isContact(profilePerson._id)}
          isBlocked={isBlockedByMe(profilePerson._id)}
          nickname={getContactRecord(profilePerson._id)?.nickname}
          photosCount={messages.filter((m) => m.imageUrl).length}
          onClose={() => setShowProfileModal(false)}
          onOpenChat={() => {
            handleSelectUser(profilePerson);
            setShowProfileModal(false);
          }}
          onVoiceCall={() => {
            setShowProfileModal(false);
            handleSelectUser(profilePerson);
            startCall("voice", profilePerson);
          }}
          onVideoCall={() => {
            setShowProfileModal(false);
            handleSelectUser(profilePerson);
            startCall("video", profilePerson);
          }}
          onToggleContact={() => toggleContact(profilePerson)}
          onToggleBlock={() => handleToggleBlock(profilePerson._id)}
          onSaveNickname={(nickname) => handleSaveNickname(profilePerson._id, nickname)}
        />
      )}
    </div>
  );
};

export default Chat;