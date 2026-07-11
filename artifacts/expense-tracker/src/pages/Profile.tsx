import React from "react";
import { useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Calendar, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/format";
import { motion } from "framer-motion";

export default function Profile() {
  const { data: user, isLoading } = useGetCurrentUser({ query: { queryKey: getGetCurrentUserQueryKey() }});

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-border/50 bg-card/40 backdrop-blur overflow-hidden">
          <div className="h-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background border-b border-border/50 relative">
            <div className="absolute -bottom-10 left-8">
              <div className="w-20 h-20 rounded-full bg-secondary border-4 border-card flex items-center justify-center text-primary shadow-xl">
                <User className="w-10 h-10" />
              </div>
            </div>
          </div>
          
          <CardContent className="pt-16 pb-8 px-8">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <div className="pt-4 border-t border-border/50 space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ) : user ? (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">{user.name}</h2>
                  <div className="flex items-center text-sm text-primary">
                    <ShieldCheck className="w-4 h-4 mr-1" /> Verified Account
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Email Address</div>
                      <div className="font-medium">{user.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Member Since</div>
                      <div className="font-medium">{formatDate(user.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>Unable to load profile data.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
