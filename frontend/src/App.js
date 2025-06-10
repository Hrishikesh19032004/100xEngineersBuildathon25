import './App.css';
import { BrowserRouter, Route, Routes} from "react-router-dom";
import {Navbar} from './Components/Navbar';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Contact from './Pages/Contact';
import Footer from './Components/Footer';
import OutreachPage from './Pages/OutreachPage';
import About from './Pages/About';
import ConfirmContractPage from './Pages/ConfirmContractPage';
import InstagramAnalytics from './Pages/InstagramAnalytics';
import RazorpayPaymentDemo from './Pages/RazorpayPaymentDemo';
import VideoGenerator from './Pages/VideoGenerator';
import InfluencerChat from './Pages/InfluencerChat';
import SpeechToText from './Pages/SpeechToText';
import Chat from './Pages/Chat'
import ErrorPage from './Pages/ErrorPage';

const App = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/voice" element={<SpeechToText />} />
          <Route path="/analytics" element={<InstagramAnalytics />} />
          <Route path="/confirm" element={<ConfirmContractPage />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat1" element={<InfluencerChat />} />/
          <Route path="/video" element={<VideoGenerator />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/payment" element={<RazorpayPaymentDemo />} />          
          <Route path="/outreach" element={<OutreachPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
        <Footer/>
      </div>
    </BrowserRouter>
  );
};

export default App;
