'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { signInWithGoogle } from "@/app/login/google-actions"
import { signInWithGithub } from "@/app/login/github-actions"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [role, setRole] = useState('user')
  const [typewriterText, setTypewriterText] = useState('')
  const [typewriterKey, setTypewriterKey] = useState(0)

  const messages = [
    'Built by Wyhang',
    'Wyhang building dreams',
    'Wyhang really dreams big',
    'Wyhang loves ALPHV '
  ]

  useEffect(() => {
    const message = messages[typewriterKey % messages.length]
    let index = 0
    setTypewriterText('')
    
    const interval = setInterval(() => {
      if (index <= message.length) {
        setTypewriterText(message.slice(0, index))
        index++
      } else {
        clearInterval(interval)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [typewriterKey])

  const triggerTypewriter = () => {
    setTypewriterKey(prev => prev + 1)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-transparent overflow-hidden p-0 rounded-sm">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="bg-white p-6 md:p-8 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <Image src="/logoClean.png" alt="Logo" width={64} height={64} priority />
              <div>
                <h1 className="text-2xl font-bold">ALPHV ColorShapes</h1>
                <p className="text-muted-foreground text-balance mt-2 h-6">
                  {typewriterText || `Login as ${role === 'admin' ? 'Admin' : 'User'}`}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-3 bg-muted/40 rounded-sm">
              <span className={cn("text-sm font-medium", role === 'user' && "text-primary")}>User</span>
              <Switch checked={role === 'admin'} onCheckedChange={(checked) => setRole(checked ? 'admin' : 'user')} />
              <span className={cn("text-sm font-medium", role === 'admin' && "text-primary")}>Admin</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <form action={signInWithGoogle.bind(null, role)}>
                  <Button variant="outline" type="submit" className="w-full transition-all hover:scale-105 active:scale-95" onClick={triggerTypewriter}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Google
                  </Button>
                </form>
                <form action={signInWithGithub.bind(null, role)}>
                  <Button variant="outline" type="submit" className="w-full transition-all hover:scale-105 active:scale-95" onClick={triggerTypewriter}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </Button>
                </form>
              </div>
            </div>
          </div>
          <div className="backdrop-blur-sm bg-transparent relative hidden md:flex items-center justify-center overflow-hidden">
            <Image src="/logo.png" alt="Logo" width={200} height={200} className="scale-[1.4]" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
