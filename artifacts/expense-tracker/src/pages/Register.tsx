import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Wallet, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import { useRegisterUser } from "@workspace/api-client-react";
import { setToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegisterUser();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          setToken(data.token);
          toast({
            title: "Welcome to Ledger",
            description: "Your account has been created successfully.",
          });
          setLocation("/dashboard");
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: error?.message || "There was an error creating your account.",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      {/* Left side - Visual */}
      <div className="hidden md:flex flex-1 bg-card border-r border-border relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-background to-background" />
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-lg"
        >
          <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
              Start your journey to financial clarity.
            </h2>
            <p className="text-muted-foreground mb-6">
              Track your spending, understand your habits, and build a better relationship with your money.
            </p>
            <ul className="space-y-3">
              {[
                "Beautiful, intuitive dashboard",
                "Private and secure data",
                "Clear category insights",
              ].map((item, i) => (
                <li key={i} className="flex items-center text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-24">
        <div className="flex justify-end mb-12">
          <Link href="/">
            <div className="flex items-center gap-2 text-primary cursor-pointer">
              <Wallet className="w-6 h-6" />
              <span className="font-serif font-bold text-xl text-foreground">Ledger</span>
            </div>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-2 text-foreground">
            Create account
          </h1>
          <p className="text-muted-foreground mb-8">
            Set up your personal ledger in seconds.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        className="bg-card border-border h-12 px-4 focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Email address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="bg-card border-border h-12 px-4 focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-card border-border h-12 px-4 focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium rounded-xl group"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign Up
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-8 text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login">
              <span className="text-primary hover:underline cursor-pointer font-medium">
                Log in
              </span>
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
