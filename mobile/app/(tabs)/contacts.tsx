import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, UserPlus, Phone, Mail, MoreVertical } from 'lucide-react-native';

export default function ContactsScreen() {
  const contacts = [
    { id: '1', name: 'John Doe', company: 'Black Icons', phone: '+234 801 234 5678', initial: 'J' },
    { id: '2', name: 'Sarah Smith', company: 'Clean Connect', phone: '+234 703 111 2222', initial: 'S' },
    { id: '3', name: 'Michael Chen', company: 'Skills Konnect', phone: '+234 812 999 0000', initial: 'M' },
  ];

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <SafeAreaView className="flex-1">
        <View className="px-6 py-4">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-slate-900 dark:text-white text-3xl font-bold">Contacts</Text>
            <TouchableOpacity className="bg-primary p-2 rounded-xl">
              <UserPlus color="white" size={20} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="bg-card-light dark:bg-card-dark flex-row items-center px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
            <Search size={20} color="#94a3b8" />
            <TextInput 
              placeholder="Search contacts..." 
              placeholderTextColor="#94a3b8"
              className="flex-1 ml-3 text-slate-900 dark:text-white font-medium"
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {contacts.map((contact) => (
              <View key={contact.id} className="bg-card-light dark:bg-card-dark p-4 rounded-2xl mb-3 border border-slate-200 dark:border-slate-800 flex-row items-center shadow-sm">
                <View className="bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 rounded-full items-center justify-center mr-4">
                  <Text className="text-primary font-bold text-lg">{contact.initial}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 dark:text-white font-bold">{contact.name}</Text>
                  <Text className="text-slate-400 text-xs">{contact.company}</Text>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <Phone size={16} color="#6366f1" />
                  </TouchableOpacity>
                  <TouchableOpacity className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <MoreVertical size={16} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
