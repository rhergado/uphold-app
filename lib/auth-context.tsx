"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import bcrypt from "bcryptjs";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("uphold_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Hash the password
      const password_hash = await bcrypt.hash(password, 10);

      // Insert user into Supabase
      const { data, error } = await supabase
        .from("users")
        .insert([{ name, email, password_hash }])
        .select()
        .single();

      if (error) {
        console.error("Signup error details:", JSON.stringify(error, null, 2));
        if (error.code === "23505") {
          // Unique violation - email already exists
          alert("An account with this email already exists");
        } else {
          alert(`Error creating account: ${error.message || 'Please try again.'}`);
          console.error("Signup error:", error);
        }
        return false;
      }

      // Set as current user
      const newUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
      };
      setUser(newUser);
      localStorage.setItem("uphold_user", JSON.stringify(newUser));

      return true;
    } catch (error) {
      console.error("Signup error:", error);
      alert("An unexpected error occurred. Please try again.");
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Find user by email
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .limit(1);

      if (error) {
        console.error("Login error:", error);
        alert("An error occurred. Please try again.");
        return false;
      }

      if (!users || users.length === 0) {
        alert("Invalid email or password");
        return false;
      }

      const foundUser = users[0];

      // Verify password
      const passwordMatch = await bcrypt.compare(password, foundUser.password_hash);

      if (!passwordMatch) {
        alert("Invalid email or password");
        return false;
      }

      // Set as current user
      const userWithoutPassword: User = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
      };
      setUser(userWithoutPassword);
      localStorage.setItem("uphold_user", JSON.stringify(userWithoutPassword));

      return true;
    } catch (error) {
      console.error("Login error:", error);
      alert("An unexpected error occurred. Please try again.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("uphold_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
