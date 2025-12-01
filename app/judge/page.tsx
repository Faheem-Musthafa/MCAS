"use client"

import Link from "next/link"
import { ArrowLeft, Construction } from "lucide-react"

// TODO: Judge Panel is temporarily disabled while we rebuild it for the new position-based scoring system
// The old scoring system used criteria-based scoring (e.g., Creativity: 80/100, Technique: 90/100)
// The new system uses position-based results (1st, 2nd, 3rd place) with automatic point calculation

export default function JudgePanelPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 mb-6">
          <Construction className="w-10 h-10 text-amber-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-3">Judge Panel Under Maintenance</h1>
        
        <p className="text-muted-foreground mb-6">
          We&apos;re upgrading the judge panel to support our new position-based scoring system. 
          Results can now be entered directly from the Admin Panel.
        </p>

        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-3">New Scoring System</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>🥇 1st Place = 10 points</p>
            <p>🥈 2nd Place = 7 points</p>
            <p>🥉 3rd Place = 5 points</p>
            <p>🎖️ Participation = 1 point</p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-medium rounded-xl hover:bg-accent/90 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <p className="text-xs text-muted-foreground mt-6">
          Administrators can enter results via Admin Panel → Results tab
        </p>
      </div>
    </div>
  )
}

/*
===================================================================================
COMMENTED OUT: Original Judge Panel Code (Criteria-Based Scoring System)
===================================================================================

import { useState, useEffect } from "react"
import Image from "next/image"
import { Lock, CheckCircle2, Clock, Send, Star, Trophy, Palette, User, Loader2 } from "lucide-react"
import type { DbJudge, DbEvent, DbTeam, DbScore, DbJudgeScore, DbScoringCriteria } from "@/lib/supabase/types"

interface ScoreWithJudgeScores extends DbScore {
  judge_scores: DbJudgeScore[]
}

// Original JudgePanelPage component with criteria-based scoring
// This used scoring_criteria table with categories like:
// - Creativity (max 100)
// - Technique (max 100)
// - Presentation (max 100)
// Judges would rate each criteria and scores were aggregated

// To restore this functionality:
// 1. Uncomment this code
// 2. Update types to include DbScore, DbJudgeScore, DbScoringCriteria
// 3. Re-enable scoring_criteria and scores tables in schema
// 4. Update the scoring system to work alongside position-based results

===================================================================================
*/
