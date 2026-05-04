import React from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PremiumCard } from '@/components/PremiumCard';
import { Send, Users, Activity, Sparkles, Plus, Heart, Vote, GraduationCap } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardScreen() {
  const { organization } = useAuth();
  const orgType = organization?.type || 'business';

  const getDashboardTitle = () => {
    if (orgType === 'religious') return 'Religious Dashboard';
    if (orgType === 'political') return 'Political Center';
    if (orgType === 'education') return 'Academic Portal';
    return 'ReachOut';
  };

  const getContactLabel = () => {
    if (orgType === 'religious') return 'Souls';
    if (orgType === 'political') return 'Voter Base';
    if (orgType === 'education') return 'Students';
    return 'Contacts';
  };

  const getCampaignLabel = () => {
    if (orgType === 'religious') return 'Outreach';
    if (['political', 'nonprofit', 'education'].includes(orgType)) return 'Engagements';
    return 'Campaigns';
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <SafeAreaView className="flex-1">
        <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-slate-500 dark:text-slate-400 font-medium">Welcome back,</Text>
              <Text className="text-slate-900 dark:text-white text-3xl font-bold">{getDashboardTitle()}</Text>
            </View>
            <TouchableOpacity className="bg-primary p-3 rounded-2xl shadow-lg shadow-indigo-500/50">
              <Plus color="white" size={24} />
            </TouchableOpacity>
          </View>

          {/* AI Banner */}
          <View className="bg-indigo-600 rounded-3xl p-6 mb-8 flex-row justify-between items-center shadow-xl shadow-indigo-500/20">
            <View className="flex-1 pr-4">
              <View className="flex-row items-center mb-1">
                <Sparkles color="white" size={16} className="mr-2" />
                <Text className="text-indigo-100 font-bold uppercase text-xs tracking-widest">Autonomous Assistant</Text>
              </View>
              <Text className="text-white text-xl font-bold mb-1">AI is monitoring</Text>
              <Text className="text-indigo-100 text-sm">3 contacts replied to your {getCampaignLabel().toLowerCase()} recently.</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row flex-wrap justify-between">
            <View className="w-[48%]">
              <PremiumCard 
                title="Sent" 
                value="1.2k" 
                subtitle="vs last week" 
                trend="+12%"
                icon={<Send size={18} color="#6366f1" />}
              />
            </View>
            <View className="w-[48%]">
              <PremiumCard 
                title="Active" 
                value="8" 
                subtitle={getCampaignLabel().toLowerCase()} 
                icon={<Activity size={18} color="#6366f1" />}
              />
            </View>
            <View className="w-full">
              <PremiumCard 
                title={getContactLabel()} 
                value="4,892" 
                subtitle={`Verified ${getContactLabel().toLowerCase()}`} 
                icon={<Users size={18} color="#6366f1" />}
              />
            </View>
          </View>

          {/* Recent Activity Label */}
          <View className="flex-row justify-between items-center mt-4 mb-4">
            <Text className="text-slate-900 dark:text-white text-lg font-bold">Recent Activity</Text>
            <TouchableOpacity>
              <Text className="text-primary font-bold">See All</Text>
            </TouchableOpacity>
          </View>

          {/* Placeholder Activity List */}
          {[1, 2, 3].map((i) => (
            <View key={i} className="bg-card-light dark:bg-card-dark p-4 rounded-2xl mb-3 flex-row items-center border border-slate-200 dark:border-slate-800">
              <View className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl mr-4">
                <Send size={16} color="#10b981" />
              </div>
              <View className="flex-1">
                <Text className="text-slate-900 dark:text-white font-bold">Product Update SMS</Text>
                <Text className="text-slate-400 text-xs">Sent to 452 {getContactLabel().toLowerCase()} • 2h ago</Text>
              </View>
            </View>
          ))}
          
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
