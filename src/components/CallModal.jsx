import { useLanguage } from "../context/LanguageContext";

const IMAGE_BASE_URL = "http://localhost:4000/public";

// Bu komponent faqat ko'rinishni chizadi — WebRTC mantig'i Chat.jsx ichida boshqariladi
const CallModal = ({
  callState, // 'calling' | 'incoming' | 'active' | null
  callType, // 'voice' | 'video'
  personInfo, // { firstname, lastname, profilePicture }
  localVideoRef,
  remoteVideoRef,
  onAccept,
  onReject,
  onEnd,
}) => {
  const { t } = useLanguage();

  if (!callState) return null;

  const fullName = personInfo ? `${personInfo.firstname || ""} ${personInfo.lastname || ""}`.trim() : "";

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
      style={{ backgroundColor: "rgba(0,0,0,0.92)", zIndex: 2000 }}
    >
      {callType === "video" && callState === "active" && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ objectFit: "cover" }}
        />
      )}

      {callType === "video" && (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="position-absolute rounded-3"
          style={{
            width: "140px",
            height: "180px",
            objectFit: "cover",
            bottom: "140px",
            right: "24px",
            border: "2px solid #fff",
            display: callState === "active" ? "block" : "none",
          }}
        />
      )}

      <div className="text-center text-white position-relative" style={{ zIndex: 1 }}>
        <div
          className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white overflow-hidden mx-auto mb-3"
          style={{ width: "110px", height: "110px", fontSize: "40px" }}
        >
          {personInfo?.profilePicture ? (
            <img
              src={`${IMAGE_BASE_URL}/${personInfo.profilePicture}`}
              alt="avatar"
              className="w-100 h-100"
              style={{ objectFit: "cover" }}
            />
          ) : (
            fullName ? fullName[0].toUpperCase() : "U"
          )}
        </div>
        <h4 className="mb-1">{fullName}</h4>
        <p className="text-secondary mb-4">
          {callState === "calling" && t("calling")}
          {callState === "incoming" &&
            (callType === "video" ? t("incoming_video_call") : t("incoming_voice_call"))}
          {callState === "active" && (callType === "video" ? t("video_call") : t("voice_call"))}
        </p>
      </div>

      <div className="d-flex gap-4">
        {callState === "incoming" ? (
          <>
            <button
              className="btn btn-danger rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "60px", height: "60px" }}
              onClick={onReject}
              title={t("reject")}
            >
              <i className="bi bi-telephone-x fs-4"></i>
            </button>
            <button
              className="btn btn-success rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "60px", height: "60px" }}
              onClick={onAccept}
              title={t("accept")}
            >
              <i className="bi bi-telephone-fill fs-4"></i>
            </button>
          </>
        ) : (
          <button
            className="btn btn-danger rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "60px", height: "60px" }}
            onClick={onEnd}
            title={t("end_call")}
          >
            <i className="bi bi-telephone-x fs-4"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default CallModal;
