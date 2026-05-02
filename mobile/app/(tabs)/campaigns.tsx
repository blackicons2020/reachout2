import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Clock, CheckCircle, Plus } from 'lucide-react-native';

export default function CampaignsScreen() {
  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <SafeAreaView className="flex-1">
        <View className="px-6 py-4 flex-row justify-between items-center">
          <Text className="text-slate-900 dark:text-white text-3xl font-bold">Campaigns</Text>
          <TouchableOpacity className="bg-primary p-2 rounded-xl">
            <Plus color="white" size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
          {/* Active Campaigns */}
          <Text className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest mb-4 mt-4">Active Now</Text>
          
          <View className="bg-card-light dark:bg-card-dark p-6 rounded-3xl mb-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-xl mr-3">
                <Send size={20} color="#6366f1" />
              </View>
              <View>
                <Text className="text-slate-900 dark:text-white font-bold text-lg">Product Launch SMS</Text>
                <Text className="text-slate-400 text-sm">Targeting: New Customers</Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Sending • 84%</Text>
              </View>
              <TouchableOpacity className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
                <Text className="text-slate-900 dark:text-white font-bold text-xs">Pause</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Scheduled */}
          <Text className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest mb-4">Scheduled</Text>
          
          {/* 
          {[1, 2].map((i) => (
            <View key={i} className="bg-card-light dark:bg-card-dark p-5 rounded-2xl mb-4 border border-slate-200 dark:border-slate-800 flex-row items-center">
              <View className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl mr-4">
                <Clock size={20} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 dark:text-white font-bold">Monthly Newsletter</Text>
                <Text className="text-slate-400 text-xs">Scheduled for Tomorrow, 9:00 AM</Text>
              </View>
              <CheckCircle size={18} color="#94a3b8" />
            </View>
          ))}
          */}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
