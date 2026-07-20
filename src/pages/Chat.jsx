import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useLanguage } from "../context/LanguageContext";
import { getAllUsersApi } from "../api/userApi";
import { getConversationsApi, getConversationHistoryApi } from "../api/chatApi";

const IMAGE_BASE_URL = "http://localhost:4000/public";

const UserRow = ({ person, active, onClick, subtitle }) => (
  <button
    onClick={onClick}
    className={`btn w-100 text-start d-flex align-items-center gap-2 rounded-3 mb-1 px-2 py-2 ${
      active ? "bg-light" : ""
    }`}
    style={{ border: "none" }}
  >
    <div
      className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white overflow-hidden flex-shrink-0"
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
    <div className="flex-grow-1 overflow-hidden">
      <p className="mb-0 small fw-medium text-truncate">
        {person.firstname} {person.lastname}
      </p>
      {subtitle && (
        <p className="mb-0 small text-secondary text-truncate">{subtitle}</p>
      )}
    </div>
  </button>
);

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  const { t } = useLanguage();

  const [allUsers, setAllUsers] = useState([]);
  const [conversations, setConversations] = useState([]); // [{userId, lastMessage, createdAt}]
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  // Boshlang'ich ma'lumotlarni yuklash: barcha foydalanuvchilar + kontaktlar
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setLoading(true);
        const [usersRes, convRes] = await Promise.all([
          getAllUsersApi(),
          getConversationsApi(),
        ]);
        setAllUsers(usersRes.data.users.filter((u) => u._id !== user._id));
        setConversations(convRes.data.conversations);

        // Agar URL'da /chat/:userId bo'lsa, o'sha odamni avtomatik tanlaymiz
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

  // Tanlangan odam o'zgarganda, suhbat tarixini yuklaymiz
  useEffect(() => {
    if (!selectedUser) return;

    const fetchHistory = async () => {
      try {
        const res = await getConversationHistoryApi(selectedUser._id);
        setMessages(res.data.messages);
      } catch (error) {
        console.error("Suhbat tarixini yuklashda xatolik:", error);
      }
    };

    fetchHistory();
  }, [selectedUser]);

  // Real vaqtda kelayotgan xabarlarni tinglash
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (message) => {
      // Agar hozir ochiq turgan suhbatdan bo'lsa — darhol ko'rsatamiz
      if (selectedUser && message.sender === selectedUser._id) {
        setMessages((prev) => [...prev, message]);
      }

      // Kontaktlar ro'yxatini yangilaymiz (yangi suhbatdosh bo'lsa qo'shiladi)
      setConversations((prev) => {
        const exists = prev.find((c) => c.userId === message.sender);
        const updated = exists
          ? prev.map((c) =>
              c.userId === message.sender
                ? { ...c, lastMessage: message.text, createdAt: message.createdAt }
                : c
            )
          : [
              { userId: message.sender, lastMessage: message.text, createdAt: message.createdAt },
              ...prev,
            ];
        return updated;
      });
    };

    socket.on("getMessage", handleIncoming);
    return () => socket.off("getMessage", handleIncoming);
  }, [socket, selectedUser]);

  // Har yangi xabarda pastga aylantirish
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectUser = (person) => {
    setSelectedUser(person);
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

    // Optimistik ravishda o'z xabarimizni darhol ko'rsatamiz
    setMessages((prev) => [
      ...prev,
      { sender: user._id, receiver: selectedUser._id, text: text.trim(), createdAt: new Date().toISOString() },
    ]);

    // Kontaktlar ro'yxatini yangilash
    setConversations((prev) => {
      const exists = prev.find((c) => c.userId === selectedUser._id);
      const updated = exists
        ? prev.map((c) =>
            c.userId === selectedUser._id
              ? { ...c, lastMessage: text.trim(), createdAt: new Date().toISOString() }
              : c
          )
        : [
            { userId: selectedUser._id, lastMessage: text.trim(), createdAt: new Date().toISOString() },
            ...prev,
          ];
      return updated;
    });

    setText("");
  };

  const findUserById = (id) => allUsers.find((u) => u._id === id);

  const filteredSearchResults = searchTerm.trim()
    ? allUsers.filter((u) => {
        const full = `${u.firstname} ${u.lastname} ${u.username}`.toLowerCase();
        return full.includes(searchTerm.toLowerCase());
      })
    : [];

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
        {/* Chap panel — qidiruv + kontaktlar */}
        <div
          className="border-end d-flex flex-column"
          style={{ width: "300px", flexShrink: 0 }}
        >
          <div className="p-3 border-bottom">
            <div className="d-flex align-items-center gap-2 bg-light rounded-pill px-3 py-2">
              <i className="bi bi-search text-secondary"></i>
              <input
                type="text"
                className="form-control border-0 bg-transparent shadow-none p-0"
                placeholder={t("chat_search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-grow-1 overflow-auto p-2">
            {searchTerm.trim() ? (
              <>
                <p className="text-secondary small px-2 mt-1">{t("chat_all_users")}</p>
                {filteredSearchResults.length === 0 ? (
                  <p className="text-secondary small px-2">{t("no_results")}</p>
                ) : (
                  filteredSearchResults.map((person) => (
                    <UserRow
                      key={person._id}
                      person={person}
                      active={selectedUser?._id === person._id}
                      onClick={() => {
                        handleSelectUser(person);
                        setSearchTerm("");
                      }}
                    />
                  ))
                )}
              </>
            ) : (
              <>
                <p className="text-secondary small px-2 mt-1">{t("chat_contacts")}</p>
                {conversations.length === 0 ? (
                  <p className="text-secondary small px-2">{t("chat_no_contacts")}</p>
                ) : (
                  conversations.map((conv) => {
                    const person = findUserById(conv.userId);
                    if (!person) return null;
                    return (
                      <UserRow
                        key={conv.userId}
                        person={person}
                        active={selectedUser?._id === person._id}
                        subtitle={conv.lastMessage}
                        onClick={() => handleSelectUser(person)}
                      />
                    );
                  })
                )}
              </>
            )}
          </div>
        </div>

        {/* O'ng panel — tanlangan suhbat */}
        <div className="flex-grow-1 d-flex flex-column">
          {!selectedUser ? (
            <div className="d-flex flex-grow-1 align-items-center justify-content-center text-secondary">
              {t("chat_no_conversation")}
            </div>
          ) : (
            <>
              <div className="p-3 border-bottom d-flex align-items-center gap-2">
                <div
                  className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white overflow-hidden flex-shrink-0"
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
                <span className="fw-medium">
                  {selectedUser.firstname} {selectedUser.lastname}
                </span>
              </div>

              <div className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-2">
                {messages.map((m, idx) => {
                  const isMine = m.sender === user._id;
                  return (
                    <div
                      key={idx}
                      className={`d-flex ${isMine ? "justify-content-end" : "justify-content-start"}`}
                    >
                      <div
                        className={`px-3 py-2 rounded-4 ${
                          isMine ? "bg-danger text-white" : "bg-light text-dark"
                        }`}
                        style={{ maxWidth: "70%" }}
                      >
                        <p className="mb-0 small">{m.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef}></div>
              </div>

              <form onSubmit={handleSend} className="p-3 border-top d-flex gap-2">
                <input
                  type="text"
                  className="form-control rounded-pill"
                  placeholder={t("chat_write_message")}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button className="btn btn-danger rounded-circle" type="submit" style={{ width: "40px", height: "40px" }}>
                  <i className="bi bi-send"></i>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;