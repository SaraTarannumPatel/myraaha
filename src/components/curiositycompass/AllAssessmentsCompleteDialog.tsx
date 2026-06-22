import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, Gift, Map } from "lucide-react";

/**
 * Fires once when the user finishes all three Curiosity Compass assessments.
 * Persists `compass_finale_shown` flag in profiles.journey_responses so it
 * never reopens.
 */
export default function AllAssessmentsCompleteDialog() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const allDone =
    !!profile?.journey_responses?.assessment_completed &&
    !!profile?.journey_responses?.psychometric_completed &&
    !!profile?.journey_responses?.interests_completed;
  const alreadyShown = !!profile?.journey_responses?.compass_finale_shown;

  useEffect(() => {
    if (allDone && !alreadyShown) setOpen(true);
  }, [allDone, alreadyShown]);

  const dismiss = async () => {
    setOpen(false);
    await updateProfile({
      journey_responses: {
        ...(profile?.journey_responses || {}),
        compass_finale_shown: true,
      },
    } as any);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss(); }}>
      <DialogContent className="max-w-md rounded-3xl border-primary/30 bg-gradient-to-br from-primary/[0.04] to-accent/[0.04] p-0 overflow-hidden">
        <div className="p-6 sm:p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-primary/15 flex items-center justify-center mx-auto shadow-inner">
            <PartyPopper className="text-primary" size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-2xl font-bold text-foreground leading-tight">
              Congratulations — all assessments complete!
            </h3>
            <p className="font-body text-sm text-foreground/85 leading-relaxed">
              The entire app has now been unlocked for you. Your Rewards are waiting in the Rewards
              section. Make sure to activate them before they expire. They cost a lot, homie!!!
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <Button
              size="lg"
              variant="outline"
              onClick={async () => { await dismiss(); navigate("/dashboard/achievements"); }}
              className="rounded-full font-body font-semibold"
            >
              <Gift size={16} className="mr-2" /> Go to Rewards
            </Button>
            <Button
              size="lg"
              onClick={async () => { await dismiss(); }}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold"
            >
              <Map size={16} className="mr-2" /> See my Path Map
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
