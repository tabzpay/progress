import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Bell, ArrowRight, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { cn } from "../components/ui/utils";
import { motion, AnimatePresence } from "motion/react";

const slides = [
  {
    icon: Shield,
    title: "Lend with confidence",
    description: "Create clear, documented agreements in seconds. No more awkward 'he said, she said'.",
    color: "bg-blue-500",
  },
  {
    icon: Users,
    title: "Build trust together",
    description: "Both parties see the exact same balance and history. Complete transparency for everyone.",
    color: "bg-primary",
  },
  {
    icon: Bell,
    title: "We handle the reminders",
    description: "Progress sends neutral, friendly nudges so you can preserve your relationships.",
    color: "bg-green-500",
  },
];

export function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex justify-end p-6 relative z-10">
        <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground hover:text-foreground">
          Skip
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 max-w-lg mx-auto w-full relative z-10">
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Icon Circle */}
              <div className="relative mx-auto w-24 h-24 mb-10">
                <div className={cn(
                  "absolute inset-0 rounded-full opacity-20 blur-xl",
                  slides[currentSlide].color
                )} />
                <div className={cn(
                  "relative h-full w-full rounded-2xl flex items-center justify-center bg-background border shadow-lg",

                )}>
                  {(() => {
                    const Icon = slides[currentSlide].icon;
                    return <Icon className={cn("w-10 h-10", slides[currentSlide].color.replace("bg-", "text-"))} />;
                  })()}
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-4 tracking-tight">
                {slides[currentSlide].title}
              </h2>
              <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  idx === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>

          <Button
            className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02]"
            onClick={handleNext}
          >
            {currentSlide < slides.length - 1 ? (
              <>
                Next <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Get Started <Check className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
