import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import PillNav from "./components/ui/PillNav";
import LandingPage from "./components/LandingPage";
import ChatInterface from "./components/ChatInterface";
import ClickSpark from "./components/ui/ClickSpark";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Launch Agent", href: "/app" },
];

function AppShell() {
  const { pathname } = useLocation();

  return (
    <>
      <PillNav
        items={NAV_ITEMS}
        activeHref={pathname}
        logoAlt="TT"
        baseColor="#fff"
        pillColor="#060010"
        hoveredPillTextColor="#060010"
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<ChatInterface />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ClickSpark
      sparkColor='#fff'
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ClickSpark>
  );
}
