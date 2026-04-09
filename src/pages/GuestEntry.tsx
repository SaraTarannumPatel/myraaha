import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import guestIllustration from "@/assets/auth-guest-illustration.png";

const GuestEntry = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleEnter = () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    localStorage.setItem("myraaha_guest_name", name.trim());
    localStorage.setItem("myraaha_is_guest", "true");
    navigate("/get-started");
  };

  return (
    <div className="min-h-screen bg-[hsl(60,14%,98%)] flex flex-col">
      {/* Top bar: Logo + progress */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <span className="font-display text-xl font-bold text-[hsl(230,40%,25%)]">M</span>
          </div>
          <span className="text-xs text-muted-foreground font-body">5%</span>
          <div className="flex-1 h-1.5 rounded-full bg-[hsl(0,0%,88%)]">
            <div className="h-full w-[5%] rounded-full bg-[hsl(158,17%,37%)]" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 pb-8 lg:px-16 lg:justify-center max-w-lg mx-auto w-full lg:max-w-none lg:mx-0">
        {/* Heading + Illustration */}
        <div className="relative mt-4 mb-6 lg:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-start"
          >
            <h1 className="font-display text-[2.8rem] sm:text-[3.5rem] lg:text-[4.5rem] leading-[0.92] font-bold text-[hsl(230,40%,25%)] flex-1 z-10">
              Find your<br />path, at<br />your<br />pace!
            </h1>
            <div className="w-[40%] sm:w-[35%] lg:w-[30%] -mt-4 -mr-2">
              <img
                src={guestIllustration}
                alt=""
                className="w-full h-auto object-contain"
                width={512}
                height={640}
              />
            </div>
          </motion.div>
        </div>

        {/* Yellow pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-8"
        >
          <span className="inline-block px-5 py-2 rounded-full bg-[hsl(45,80%,75%)] font-body text-sm italic text-[hsl(230,40%,25%)]">
            No sign-up needed to try this
          </span>
        </motion.div>

        {/* Name input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-full h-14 rounded-2xl bg-[hsl(0,0%,85%,0.5)] px-5 font-body text-sm text-foreground placeholder:text-muted-foreground outline-none border-none focus:ring-2 focus:ring-[hsl(158,17%,37%)] transition-all"
            onKeyDown={(e) => e.key === "Enter" && handleEnter()}
          />
        </motion.div>

        {/* Bottom: Login/Sign Up link + Enter button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex items-center justify-between mt-auto pt-12 lg:pt-16"
        >
          <button
            onClick={() => navigate("/auth")}
            className="font-body text-sm text-foreground font-medium"
          >
            Login/Sign Up
          </button>
          <button
            onClick={handleEnter}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-[hsl(230,40%,25%)] font-body text-sm font-semibold text-[hsl(45,80%,65%)] hover:bg-[hsl(230,40%,20%)] transition-colors"
          >
            Enter
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default GuestEntry;
