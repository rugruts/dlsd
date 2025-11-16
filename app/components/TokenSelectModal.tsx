import React, { useState } from 'react';
import { View, Text, Modal, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { TokenItem } from '../types/wallet';

interface TokenSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (token: TokenItem) => void;
  tokens: TokenItem[];
  selectedToken?: TokenItem;
}

export function TokenSelectModal({
  visible,
  onClose,
  onSelect,
  tokens,
  selectedToken,
}: TokenSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTokens = tokens.filter(token =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectToken = (token: TokenItem) => {
    onSelect(token);
    onClose();
    setSearchQuery('');
  };

  const renderTokenItem = ({ item }: { item: TokenItem }) => (
    <TouchableOpacity
      className={`flex-row items-center p-4 ${
        selectedToken?.mint === item.mint ? 'bg-primary/10' : ''
      }`}
      onPress={() => handleSelectToken(item)}
    >
      {item.icon && <Image source={item.icon} className="w-8 h-8 mr-3" />}
      <View className="flex-1">
        <Text className="text-text font-semibold">{item.symbol}</Text>
        <Text className="text-textSecondary text-sm">{item.name}</Text>
      </View>
      <Text className="text-text">{item.balance.toFixed(4)}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black bg-opacity-50 justify-end">
        <View className="bg-background rounded-t-xl max-h-3/4">
          <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
            <Text className="text-text text-xl font-bold">Select Token</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-textSecondary text-xl">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="px-6 py-4">
            <TextInput
              className="bg-surface border border-gray-300 rounded-lg p-4 text-text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Token List */}
          <FlatList
            data={filteredTokens}
            renderItem={renderTokenItem}
            keyExtractor={(item) => item.mint}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View className="h-px bg-gray-100 mx-6" />}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </View>
    </Modal>
  );
}