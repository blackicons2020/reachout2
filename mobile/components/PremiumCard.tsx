import React from 'react';
import { View, Text } from 'react-native';

interface PremiumCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
}

export function PremiumCard({ title, value, subtitle, icon, trend }: PremiumCardProps) {
  return (
    <View className="bg-card-light dark:bg-card-dark p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 mb-4">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-wider">
          {title}
        </Text>
        {icon}
      </View>
      <Text className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
        {value}
      </Text>
      {subtitle && (
        <View className="flex-row items-center mt-2">
          {trend && (
            <Text className={`text-xs font-bold mr-2 ${trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trend}
            </Text>
          )}
          <Text className="text-slate-400 dark:text-slate-500 text-xs font-medium">
            {subtitle}
          </Text>
        </View>
      )}
    </View>
  );
}
