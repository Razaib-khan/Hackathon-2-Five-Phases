// src/models/Analytics.ts
// Analytics model for the AIDO task management application

import { PrismaClient } from '@prisma/client';

export interface AnalyticsResponse {
  id: string;
  user_id: string;
  date: Date;
  tasks_created: number;
  tasks_completed: number;
  time_spent_minutes: number;
  created_at: Date;
  updated_at: Date;
}

export interface DashboardAnalytics {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  due_today: number;
  priority_distribution: {
    high: number;
    medium: number;
    low: number;
    none: number;
  };
  completion_trends: Array<{
    date: Date;
    completed: number;
    created: number;
  }>;
  category_breakdown: Array<{
    tag_name: string;
    tag_color: string;
    task_count: number;
    completed_count: number;
  }>;
  streak_days: number;
  longest_streak: number;
  total_time_spent: number;
  average_completion_time: number;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_completed_date: Date | null;
  streak_history: Array<{
    date: Date;
    completed: boolean;
  }>;
}

export class AnalyticsModel {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async getDashboardAnalytics(userId: string, period: 'week' | 'month' | 'year' | 'all' = 'month'): Promise<DashboardAnalytics> {
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get total tasks for user
    const totalTasks = await this.prisma.task.count({
      where: { user_id: userId }
    });

    // Get completed tasks
    const completedTasks = await this.prisma.task.count({
      where: {
        user_id: userId,
        completed: true
      }
    });

    // Get overdue tasks
    const overdueTasks = await this.prisma.task.count({
      where: {
        user_id: userId,
        completed: false,
        due_date: {
          lt: new Date()
        }
      }
    });

    // Get tasks due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueToday = await this.prisma.task.count({
      where: {
        user_id: userId,
        completed: false,
        due_date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get priority distribution
    const priorityCounts = await this.prisma.task.groupBy({
      by: ['priority'],
      where: { user_id: userId },
      _count: true
    });

    const priorityDistribution = {
      high: 0,
      medium: 0,
      low: 0,
      none: 0
    };

    priorityCounts.forEach(count => {
      if (count.priority in priorityDistribution) {
        priorityDistribution[count.priority as keyof typeof priorityDistribution] = count._count;
      }
    });

    // Get completion trends (last 7 days)
    const completionTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const completed = await this.prisma.task.count({
        where: {
          user_id: userId,
          completed: true,
          completed_at: {
            gte: date,
            lt: nextDate
          }
        }
      });

      const created = await this.prisma.task.count({
        where: {
          user_id: userId,
          created_at: {
            gte: date,
            lt: nextDate
          }
        }
      });

      completionTrends.push({
        date,
        completed,
        created
      });
    }

    // Get category breakdown (using tags)
    const categoryBreakdown = [];
    const tags = await this.prisma.tag.findMany({
      where: { user_id: userId }
    });

    for (const tag of tags) {
      const taskCount = await this.prisma.taskTag.count({
        where: {
          tag_id: tag.id,
          task: { user_id: userId }
        }
      });

      const completedCount = await this.prisma.taskTag.count({
        where: {
          tag_id: tag.id,
          task: { user_id: userId, completed: true }
        }
      });

      categoryBreakdown.push({
        tag_name: tag.name,
        tag_color: tag.color,
        task_count: taskCount,
        completed_count: completedCount
      });
    }

    // Calculate streak data
    const streakData = await this.getStreakData(userId);

    // Calculate total time spent
    const totalTasksWithTime = await this.prisma.task.aggregate({
      where: { user_id: userId },
      _sum: { time_spent: true }
    });

    const totalTimeSpent = totalTasksWithTime._sum.time_spent || 0;

    // Calculate average completion time
    let averageCompletionTime = 0;
    if (completedTasks > 0) {
      const totalCompletionTime = await this.prisma.task.aggregate({
        where: {
          user_id: userId,
          completed: true,
          created_at: { gte: startDate }
        },
        _sum: { time_spent: true }
      });

      averageCompletionTime = completedTasks > 0 ? (totalCompletionTime._sum.time_spent || 0) / completedTasks : 0;
    }

    return {
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      overdue_tasks: overdueTasks,
      due_today: dueToday,
      priority_distribution: priorityDistribution,
      completion_trends: completionTrends,
      category_breakdown: categoryBreakdown,
      streak_days: streakData.current_streak,
      longest_streak: streakData.longest_streak,
      total_time_spent: totalTimeSpent,
      average_completion_time: averageCompletionTime
    };
  }

  async getStreakData(userId: string): Promise<StreakData> {
    // Get all completed tasks for the user
    const completedTasks = await this.prisma.task.findMany({
      where: {
        user_id: userId,
        completed: true,
        completed_at: { not: null }
      },
      orderBy: { completed_at: 'desc' },
      select: {
        completed_at: true
      }
    });

    // Convert to array of dates and sort
    const completedDates = completedTasks
      .map(task => task.completed_at)
      .filter(date => date !== null) as Date[];

    completedDates.sort((a, b) => b.getTime() - a.getTime());

    // Calculate streaks
    if (completedDates.length === 0) {
      return {
        current_streak: 0,
        longest_streak: 0,
        last_completed_date: null,
        streak_history: []
      };
    }

    const lastCompletedDate = completedDates[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDate = new Date(lastCompletedDate);
    lastDate.setHours(0, 0, 0, 0);

    // Calculate the current streak
    let currentStreak = 0;
    let currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - 1); // Start from yesterday

    // Check if user completed a task today
    const completedToday = completedDates.some(date => {
      const taskDate = new Date(date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });

    if (completedToday) {
      currentStreak = 1;
      currentDate = today;
    }

    // Calculate streak backwards
    let streakDate = new Date(currentDate);
    let streakCount = currentStreak;

    while (streakDate >= lastDate) {
      const streakDateCheck = new Date(streakDate);
      streakDateCheck.setHours(0, 0, 0, 0);

      const hasTaskCompleted = completedDates.some(date => {
        const taskDate = new Date(date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === streakDateCheck.getTime();
      });

      if (hasTaskCompleted) {
        streakCount++;
      } else {
        // If we encounter a day without completion, break the streak
        break;
      }

      streakDate.setDate(streakDate.getDate() - 1);
    }

    currentStreak = streakCount;

    // Calculate longest streak
    let longestStreak = currentStreak;
    let currentRun = 0;

    // Go through each day to calculate the longest streak
    const dateMap: { [key: string]: boolean } = {};
    for (const date of completedDates) {
      const dateKey = new Date(date).toDateString();
      dateMap[dateKey] = true;
    }

    // Get the range of dates to check
    const allDates: Date[] = [];
    let dateCheck = new Date(lastDate);
    const firstDate = new Date(Math.min(...completedDates.map(d => d.getTime())));

    while (dateCheck <= firstDate) {
      allDates.push(new Date(dateCheck));
      dateCheck.setDate(dateCheck.getDate() + 1);
    }

    let maxStreak = 0;
    let tempStreak = 0;

    for (const date of allDates) {
      const dateKey = date.toDateString();
      if (dateMap[dateKey]) {
        tempStreak++;
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 0;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);

    // Create streak history (last 30 days)
    const streakHistory = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const hasTaskCompleted = completedDates.some(taskDate => {
        const taskDateCheck = new Date(taskDate);
        taskDateCheck.setHours(0, 0, 0, 0);
        return taskDateCheck.getTime() === date.getTime();
      });

      streakHistory.push({
        date,
        completed: hasTaskCompleted
      });
    }

    return {
      current_streak: currentStreak,
      longest_streak: maxStreak,
      last_completed_date: lastCompletedDate,
      streak_history: streakHistory
    };
  }

  async createAnalyticsRecord(userId: string, date: Date, data: Partial<AnalyticsResponse>): Promise<AnalyticsResponse> {
    const analytics = await this.prisma.analytics.upsert({
      where: {
        user_id_date: {
          user_id: userId,
          date: date
        }
      },
      update: {
        tasks_created: data.tasks_created || 0,
        tasks_completed: data.tasks_completed || 0,
        time_spent_minutes: data.time_spent_minutes || 0,
        updated_at: new Date()
      },
      create: {
        user_id: userId,
        date: date,
        tasks_created: data.tasks_created || 0,
        tasks_completed: data.tasks_completed || 0,
        time_spent_minutes: data.time_spent_minutes || 0
      },
      select: {
        id: true,
        user_id: true,
        date: true,
        tasks_created: true,
        tasks_completed: true,
        time_spent_minutes: true,
        created_at: true,
        updated_at: true,
      }
    });

    return {
      id: analytics.id,
      user_id: analytics.user_id,
      date: analytics.date,
      tasks_created: analytics.tasks_created,
      tasks_completed: analytics.tasks_completed,
      time_spent_minutes: analytics.time_spent_minutes,
      created_at: analytics.created_at,
      updated_at: analytics.updated_at,
    };
  }

  async getAnalyticsByUserId(userId: string): Promise<AnalyticsResponse[]> {
    const analytics = await this.prisma.analytics.findMany({
      where: { user_id: userId },
      orderBy: { date: 'desc' }
    });

    return analytics.map(record => ({
      id: record.id,
      user_id: record.user_id,
      date: record.date,
      tasks_created: record.tasks_created,
      tasks_completed: record.tasks_completed,
      time_spent_minutes: record.time_spent_minutes,
      created_at: record.created_at,
      updated_at: record.updated_at,
    }));
  }
}