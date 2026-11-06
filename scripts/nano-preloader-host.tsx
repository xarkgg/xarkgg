import { createRoot } from "react-dom/client";
import NanoPreloader from "../components/NanoPreloader";

const mount = document.getElementById("nano-preloader-root");

if (mount) {
  try {
    const root = createRoot(mount);

    root.render(
      <NanoPreloader
        avatarSrc="assets/avatar-profile.jpg"
        avatarAlt="Manass Kusko"
        minDuration={1500}
        fadeDuration={700}
        onFinish={() => {
          root.unmount();
          mount.remove();
        }}
      />,
    );

    mount.setAttribute("data-nano-ready", "1");
  } catch (error) {
    console.error("[nano-preloader] failed to start", error);
    mount.remove();
  }
}
