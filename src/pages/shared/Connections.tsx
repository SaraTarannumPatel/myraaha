import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, Sparkles, UserPlus, Check, X } from "lucide-react";

const Connections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchConnections(); }, []);

  const fetchConnections = async () => {
    const { data } = await supabase
      .from("connections")
      .select("*")
      .or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
      .order("created_at", { ascending: false });
    setConnections(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: "accepted" | "declined") => {
    await supabase.from("connections").update({ status }).eq("id", id);
    fetchConnections();
  };

  const pending = connections.filter(c => c.status === "pending" && c.receiver_id === user!.id);
  const active = connections.filter(c => c.status === "accepted");

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Users size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Connections</h1>
            <p className="font-body text-sm text-muted-foreground">Your network of peers, mentors, and collaborators</p>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-2xl text-foreground">{active.length}</p>
          <p className="font-body text-xs text-muted-foreground">Active Connections</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-2xl text-accent">{pending.length}</p>
          <p className="font-body text-xs text-muted-foreground">Pending Requests</p>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-display text-xl text-foreground mb-4">Pending Requests</h2>
          {pending.map((conn) => (
            <div key={conn.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30">
              <div>
                <p className="font-body text-sm text-foreground">{conn.connection_type} connection request</p>
                {conn.message && <p className="font-body text-xs text-muted-foreground">{conn.message}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateStatus(conn.id, "accepted")} className="p-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20">
                  <Check size={16} />
                </button>
                <button onClick={() => updateStatus(conn.id, "declined")} className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20">
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {active.length === 0 && pending.length === 0 && (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <UserPlus className="mx-auto text-muted-foreground mb-3" size={40} />
          <h3 className="font-display text-xl text-foreground mb-2">No connections yet</h3>
          <p className="font-body text-muted-foreground">As you engage with the platform, connection opportunities will appear.</p>
        </div>
      )}
    </div>
  );
};

export default Connections;
