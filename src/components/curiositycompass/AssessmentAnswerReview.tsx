import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Pencil } from "lucide-react";

export interface ReviewItem {
  id: string;
  section?: string;
  question: string;
  answer: string;
}

interface Props {
  title: string;
  subtitle?: string;
  items: ReviewItem[];
  submitting?: boolean;
  onEdit: (questionId: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitLabel?: string;
}

/**
 * Shared "preview your answers before final submit" screen.
 * Used by Discovery, Psychometric & Interests assessments.
 */
export default function AssessmentAnswerReview({
  title,
  subtitle,
  items,
  submitting,
  onEdit,
  onBack,
  onSubmit,
  submitLabel = "Submit Final",
}: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.02] to-accent/[0.02] shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} className="text-primary" />
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">Review your answers</h3>
            <p className="font-body text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              {subtitle || `Take one last look at ${title}. Edit anything before you submit — once you submit, the result is locked.`}
            </p>
          </div>

          <div className="border-t border-border/60 pt-4 space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border/80 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] rounded-full bg-background">
                      Q{idx + 1}{item.section ? ` · ${item.section}` : ""}
                    </Badge>
                  </div>
                  <p className="font-body text-[11px] text-muted-foreground leading-snug">{item.question}</p>
                  <p className="font-body text-xs sm:text-sm font-bold text-foreground mt-1.5 leading-snug">
                    {item.answer || <span className="text-muted-foreground/70 italic">— not answered —</span>}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(item.id)}
                  className="rounded-full h-8 px-3 text-[11px] font-body shrink-0"
                >
                  <Pencil size={12} className="mr-1" /> Edit
                </Button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/60">
            <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full h-11 px-6 border border-border/50">
              <ArrowLeft size={14} className="mr-2" /> Back to questions
            </Button>
            <Button
              size="lg"
              onClick={onSubmit}
              disabled={submitting}
              className="rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold shadow-md disabled:opacity-50"
            >
              {submitting ? "Submitting…" : submitLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
