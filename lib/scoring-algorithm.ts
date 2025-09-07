// Student Scoring Algorithm with Reinforcement Learning Parameters
// Designed for educational gamification and motivation

export interface StudentAnswer {
  questionId: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  timestamp: Date;
}

export interface ScoringSession {
  sessionId: string;
  studentId: string;
  answers: StudentAnswer[];
  totalTimeSpent: number; // in seconds
  sessionStartTime: Date;
  sessionEndTime?: Date;
}

export interface ScoringResult {
  totalScore: number;
  baseScore: number;
  retentionBonus: number;
  streakBonus: number;
  correctAnswers: number;
  totalAnswers: number;
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
  motivationalMessage: string;
  detailedBreakdown: ScoreBreakdown;
  rlParameters: RLParameters; // For reinforcement learning
}

export interface ScoreBreakdown {
  correctAnswerPoints: number;
  difficultyBonusPoints: number;
  retentionBonusPoints: number;
  streakBonusPoints: number;
  timeEfficiencyBonus: number;
}

export interface RLParameters {
  rewardSignal: number; // Primary reward for RL
  stateFeatures: {
    accuracy: number;
    streakLength: number;
    retentionRate: number;
    engagementLevel: number;
    difficultyProgression: number;
  };
  actionSpace: {
    suggestedDifficulty: 'easy' | 'medium' | 'hard';
    recommendedBreakTime: number;
    nextTopicSuggestion: string;
  };
}

export class StudentScoringAlgorithm {
  private readonly CORRECT_ANSWER_POINTS = 10;
  private readonly RETENTION_BONUS_POINTS = 10; // per 45-minute interval
  private readonly STREAK_BONUS_POINTS = 30;
  private readonly RETENTION_INTERVAL = 45 * 60; // 45 minutes in seconds
  
  // Difficulty multipliers for enhanced scoring
  private readonly DIFFICULTY_MULTIPLIERS = {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0
  };

  // Time efficiency bonus (bonus for quick correct answers)
  private readonly OPTIMAL_TIME_THRESHOLDS = {
    easy: 30,    // seconds
    medium: 60,  // seconds
    hard: 120    // seconds
  };

  /**
   * Main scoring function that calculates comprehensive student scores
   * @param session - The scoring session containing student answers
   * @returns Complete scoring result with RL parameters
   */
  public calculateScore(session: ScoringSession): ScoringResult {
    const answers = session.answers;
    const totalAnswers = answers.length;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const accuracy = totalAnswers > 0 ? correctAnswers / totalAnswers : 0;

    // Calculate base score from correct answers
    const baseScoreData = this.calculateBaseScore(answers);
    
    // Calculate retention bonus
    const retentionBonus = this.calculateRetentionBonus(session.totalTimeSpent);
    
    // Calculate streak bonuses
    const streakData = this.calculateStreakBonus(answers);
    
    // Calculate time efficiency bonus
    const timeEfficiencyBonus = this.calculateTimeEfficiencyBonus(answers);

    // Total score calculation
    const totalScore = baseScoreData.totalBase + retentionBonus + 
                      streakData.totalStreakBonus + timeEfficiencyBonus;

    // Generate motivational message
    const motivationalMessage = this.generateMotivationalMessage(
      accuracy, streakData.currentStreak, correctAnswers, totalAnswers
    );

    // Prepare detailed breakdown
    const detailedBreakdown: ScoreBreakdown = {
      correctAnswerPoints: baseScoreData.correctPoints,
      difficultyBonusPoints: baseScoreData.difficultyBonus,
      retentionBonusPoints: retentionBonus,
      streakBonusPoints: streakData.totalStreakBonus,
      timeEfficiencyBonus: timeEfficiencyBonus
    };

    // Generate RL parameters
    const rlParameters = this.generateRLParameters(
      accuracy, streakData.currentStreak, session.totalTimeSpent, 
      answers, totalScore
    );

    return {
      totalScore: Math.round(totalScore),
      baseScore: Math.round(baseScoreData.totalBase),
      retentionBonus: Math.round(retentionBonus),
      streakBonus: Math.round(streakData.totalStreakBonus),
      correctAnswers,
      totalAnswers,
      accuracy: Math.round(accuracy * 100) / 100,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      motivationalMessage,
      detailedBreakdown,
      rlParameters
    };
  }

  /**
   * Calculate base score from correct answers with difficulty multipliers
   */
  private calculateBaseScore(answers: StudentAnswer[]): {
    totalBase: number;
    correctPoints: number;
    difficultyBonus: number;
  } {
    let correctPoints = 0;
    let difficultyBonus = 0;

    answers.forEach(answer => {
      if (answer.isCorrect) {
        const basePoints = this.CORRECT_ANSWER_POINTS;
        const multiplier = this.DIFFICULTY_MULTIPLIERS[answer.difficulty];
        const answerScore = basePoints * multiplier;
        
        correctPoints += basePoints;
        difficultyBonus += answerScore - basePoints;
      }
    });

    return {
      totalBase: correctPoints + difficultyBonus,
      correctPoints,
      difficultyBonus
    };
  }

  /**
   * Calculate retention bonus based on time spent learning
   */
  private calculateRetentionBonus(totalTimeSpent: number): number {
    const retentionIntervals = Math.floor(totalTimeSpent / this.RETENTION_INTERVAL);
    return retentionIntervals * this.RETENTION_BONUS_POINTS;
  }

  /**
   * Calculate streak bonuses - rewards consecutive correct answers
   */
  private calculateStreakBonus(answers: StudentAnswer[]): {
    totalStreakBonus: number;
    currentStreak: number;
    longestStreak: number;
  } {
    let currentStreak = 0;
    let longestStreak = 0;
    let totalStreakBonus = 0;
    let tempStreak = 0;

    answers.forEach(answer => {
      if (answer.isCorrect) {
        tempStreak++;
        currentStreak = tempStreak;
        longestStreak = Math.max(longestStreak, tempStreak);
        
        // Award streak bonus for every 3 consecutive correct answers
        if (tempStreak % 3 === 0) {
          totalStreakBonus += this.STREAK_BONUS_POINTS;
        }
      } else {
        tempStreak = 0;
        currentStreak = 0;
      }
    });

    return { totalStreakBonus, currentStreak, longestStreak };
  }

  /**
   * Calculate time efficiency bonus for quick correct answers
   */
  private calculateTimeEfficiencyBonus(answers: StudentAnswer[]): number {
    let bonus = 0;

    answers.forEach(answer => {
      if (answer.isCorrect) {
        const threshold = this.OPTIMAL_TIME_THRESHOLDS[answer.difficulty];
        if (answer.timeSpent <= threshold) {
          // Bonus decreases as time approaches threshold
          const efficiency = (threshold - answer.timeSpent) / threshold;
          bonus += Math.round(efficiency * 5); // Max 5 points efficiency bonus
        }
      }
    });

    return bonus;
  }

  /**
   * Generate motivational messages based on performance
   */
  private generateMotivationalMessage(
    accuracy: number, 
    currentStreak: number, 
    correct: number, 
    total: number
  ): string {
    const messages = {
      perfect: [
        "🌟 Outstanding! Perfect score achieved! You're a learning superstar!",
        "🎯 Incredible precision! Every answer was spot on!",
        "🏆 Flawless performance! You've mastered this topic!"
      ],
      excellent: [
        "🚀 Excellent work! You're showing great mastery!",
        "⭐ Superb performance! Keep up the fantastic effort!",
        "🎉 Amazing job! You're on fire with your learning!"
      ],
      good: [
        "👏 Good job! You're making solid progress!",
        "📈 Well done! Your understanding is growing stronger!",
        "💪 Nice work! Keep building on this momentum!"
      ],
      needsWork: [
        "🌱 Every expert was once a beginner! Keep practicing!",
        "💡 Learning is a journey! Each mistake teaches us something valuable!",
        "🎯 Focus on understanding - success will follow! You've got this!",
        "🔄 Practice makes progress! Try reviewing the concepts again!"
      ]
    };

    let category: keyof typeof messages;
    if (accuracy >= 0.95) category = 'perfect';
    else if (accuracy >= 0.8) category = 'excellent';
    else if (accuracy >= 0.6) category = 'good';
    else category = 'needsWork';

    const baseMessage = messages[category][Math.floor(Math.random() * messages[category].length)];
    
    // Add streak information
    let streakMessage = '';
    if (currentStreak >= 5) {
      streakMessage = ` 🔥 Amazing ${currentStreak}-answer streak!`;
    } else if (currentStreak >= 3) {
      streakMessage = ` ⚡ Great ${currentStreak}-answer streak going!`;
    }

    // Add encouragement for wrong answers
    const wrongAnswers = total - correct;
    let encouragement = '';
    if (wrongAnswers > 0 && accuracy < 0.8) {
      encouragement = ` Remember: mistakes are learning opportunities! 📚`;
    }

    return baseMessage + streakMessage + encouragement;
  }

  /**
   * Generate parameters for reinforcement learning system
   */
  private generateRLParameters(
    accuracy: number,
    streakLength: number,
    totalTime: number,
    answers: StudentAnswer[],
    totalScore: number
  ): RLParameters {
    // Calculate engagement level based on time distribution
    const avgTimePerQuestion = answers.length > 0 ? totalTime / answers.length : 0;
    const engagementLevel = Math.min(1.0, avgTimePerQuestion / 60); // Normalize to 0-1

    // Calculate difficulty progression
    const difficultyProgression = this.calculateDifficultyProgression(answers);

    // Calculate retention rate (simplified)
    const retentionRate = Math.min(1.0, totalTime / (45 * 60)); // Based on 45-min intervals

    // Primary reward signal for RL (normalized 0-1)
    const rewardSignal = Math.min(1.0, totalScore / 1000);

    // Suggest next difficulty based on performance
    let suggestedDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
    if (accuracy >= 0.9 && streakLength >= 5) suggestedDifficulty = 'hard';
    else if (accuracy < 0.6) suggestedDifficulty = 'easy';

    // Recommend break time based on engagement
    const recommendedBreakTime = engagementLevel < 0.3 ? 10 : 5; // minutes

    return {
      rewardSignal,
      stateFeatures: {
        accuracy,
        streakLength: Math.min(1.0, streakLength / 10), // Normalize
        retentionRate,
        engagementLevel,
        difficultyProgression
      },
      actionSpace: {
        suggestedDifficulty,
        recommendedBreakTime,
        nextTopicSuggestion: this.suggestNextTopic(answers, accuracy)
      }
    };
  }

  /**
   * Calculate how well student is progressing through difficulty levels
   */
  private calculateDifficultyProgression(answers: StudentAnswer[]): number {
    if (answers.length === 0) return 0;

    const recentAnswers = answers.slice(-10); // Last 10 answers
    let progression = 0;
    let weight = 0;

    recentAnswers.forEach((answer, index) => {
      const timeWeight = (index + 1) / recentAnswers.length; // Recent answers weighted more
      const difficultyScore = answer.difficulty === 'hard' ? 1 : 
                             answer.difficulty === 'medium' ? 0.5 : 0;
      const successMultiplier = answer.isCorrect ? 1 : 0.5;
      
      progression += difficultyScore * successMultiplier * timeWeight;
      weight += timeWeight;
    });

    return weight > 0 ? progression / weight : 0;
  }

  /**
   * Suggest next topic based on performance patterns
   */
  private suggestNextTopic(answers: StudentAnswer[], accuracy: number): string {
    if (answers.length === 0) return 'foundation_concepts';
    
    const subjects = Array.from(new Set(answers.map(a => a.subject)));
    const subjectPerformance = subjects.map(subject => {
      const subjectAnswers = answers.filter(a => a.subject === subject);
      const subjectAccuracy = subjectAnswers.filter(a => a.isCorrect).length / subjectAnswers.length;
      return { subject, accuracy: subjectAccuracy };
    });

    // Suggest reviewing weakest subject if overall accuracy is low
    if (accuracy < 0.7) {
      const weakestSubject = subjectPerformance.sort((a, b) => a.accuracy - b.accuracy)[0];
      return `review_${weakestSubject.subject}`;
    }

    // Suggest advancing strongest subject if doing well
    const strongestSubject = subjectPerformance.sort((a, b) => b.accuracy - a.accuracy)[0];
    return `advance_${strongestSubject.subject}`;
  }

  /**
   * Utility method to reset or adjust algorithm parameters
   */
  public updateScoringParameters(params: {
    correctAnswerPoints?: number;
    retentionBonusPoints?: number;
    streakBonusPoints?: number;
    retentionInterval?: number;
  }): void {
    // This allows for dynamic parameter adjustment for RL optimization
    Object.assign(this, params);
  }

  /**
   * Generate comprehensive learning analytics
   */
  public generateLearningAnalytics(sessions: ScoringSession[]): any {
    // This method can be expanded for detailed analytics
    return {
      totalSessions: sessions.length,
      averageScore: sessions.reduce((sum, s) => sum + this.calculateScore(s).totalScore, 0) / sessions.length,
      learningTrends: 'Detailed analytics can be implemented here',
      recommendations: 'Based on performance patterns'
    };
  }
}
