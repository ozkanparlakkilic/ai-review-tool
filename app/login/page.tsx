"use client";

import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthLayout } from "@/features/auth/components/auth-layout";

export default function LoginPage() {
  return (
    <AuthLayout>
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">Sign in</CardTitle>
          <CardDescription>
            Enter your email and password below to log into your account. <br />
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="hover:text-primary underline underline-offset-4"
            >
              Sign up
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <LoginForm />
          </Suspense>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground px-8 text-center text-sm">
            By clicking sign in, you agree to our{" "}
            <a
              href="/terms"
              className="hover:text-primary underline underline-offset-4"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="hover:text-primary underline underline-offset-4"
            >
              Privacy Policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
