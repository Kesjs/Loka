"use client"

import React from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  PageTransition,
  itemVariants,
} from "@/components/animations"
import { RecordPaymentForm } from "@/components/forms/RecordPaymentForm"
import { useAuth } from "@/lib/hooks/useAuth"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewPaiementPage() {
  const { user } = useAuth()
  const router = useRouter()

  if (!user?.id) {
    return <div>Loading...</div>
  }

  return (
    <PageTransition className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center gap-2">
        <Link
          href="/paiements"
          className="p-2 hover:bg-slate-100 rounded transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Enregistrer un paiement
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Enregistrez un nouveau paiement reçu d'un locataire
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Nouveau paiement</CardTitle>
            <CardDescription>
              Remplissez le formulaire pour enregistrer un paiement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecordPaymentForm
              proprietaireId={user.id}
              onSuccess={() => {
                setTimeout(() => router.push("/paiements"), 1500)
              }}
            />
          </CardContent>
        </Card>
      </motion.div>
    </PageTransition>
  )
}
