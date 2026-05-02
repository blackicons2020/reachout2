import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Sparkles, X, Send } from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';

export function AIChatFAB() {
  const [visible, setVisible] = useState(false);
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <TouchableOpacity 
        onPress={() => setVisible(true)}
        className="absolute bottom-24 right-6 bg-indigo-600 w-16 h-16 rounded-3xl items-center justify-center shadow-xl shadow-indigo-500/50 z-50"
        style={{ elevation: 5 }}
      >
        <Sparkles color="white" size={32} />
        <View className="absolute top-2 right-2 w-4 h-4 bg-blue-400 rounded-full border-2 border-indigo-600" />
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-card-light dark:bg-card-dark h-[80%] rounded-t-[40px] overflow-hidden">
            {/* Header */}
            <View className="flex-row justify-between items-center px-6 py-6 border-b border-slate-100 dark:border-slate-800">
              <View className="flex-row items-center">
                <View className="bg-indigo-600 p-2 rounded-xl mr-3">
                  <Sparkles color="white" size={20} />
                </View>
                <View>
                  <Text className="text-slate-900 dark:text-white font-bold text-lg">Autonomous Assistant</Text>
                  <Text className="text-emerald-500 text-xs font-bold uppercase">Online</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setVisible(false)} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                <X color="#94a3b8" size={20} />
              </TouchableOpacity>
            </View>

            {/* Chat Body */}
            <ScrollView className="flex-1 px-6 py-4">
              <View className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl self-start max-w-[80%] mb-4">
                <Text className="text-slate-900 dark:text-white">Hello! I'm your ReachOut assistant. How can I help you manage your campaigns today?</Text>
              </View>
            </ScrollView>

            {/* Input */}
            <View className="p-6 border-t border-slate-100 dark:border-slate-800 pb-10">
              <View className="flex-row items-center bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <TextInput 
                  placeholder="Ask me anything..." 
                  placeholderTextColor="#94a3b8"
                  className="flex-1 text-slate-900 dark:text-white mr-2"
                />
                <TouchableOpacity className="bg-primary p-2 rounded-xl">
                  <Send color="white" size={18} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
