import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import { TokenItem } from '../types/wallet';

interface TokenSelectorModalProps {
  visible: boolean;
  tokens: TokenItem[];
  onSelect: (token: TokenItem) => void;
  onClose: () => void;
  selectedToken?: TokenItem | null;
}

export function TokenSelectorModal({
  visible,
  tokens,
  onSelect,
  onClose,
  selectedToken,
}: TokenSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTokens = tokens.filter((token) => {
    const query = searchQuery.toLowerCase();
    return (
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query) ||
      token.address.toLowerCase().includes(query)
    );
  });

  const handleSelectToken = (token: TokenItem) => {
    onSelect(token);
    setSearchQuery('');
    onClose();
  };

  const renderToken = ({ item }: { item: TokenItem }) => {
    const isSelected = selectedToken?.address === item.address;

    return (
      <TouchableOpacity
        className={`flex-row items-center justify-between p-4 border-b border-border ${
          isSelected ? 'bg-primary/10' : ''
        }`}
        onPress={() => handleSelectToken(item)}
      >
        <View className="flex-row items-center flex-1">
          {item.icon && (
            <Image source={item.icon} className="w-10 h-10 rounded-full mr-3" />
          )}
          <View className="flex-1">
            <Text className="text-text font-semibold text-base">{item.symbol}</Text>
            <Text className="text-textSecondary text-sm">{item.name}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-text font-medium">
            {item.balance.toFixed(item.decimals > 4 ? 4 : item.decimals)}
          </Text>
          {item.usdValue !== undefined && item.usdValue > 0 && (
            <Text className="text-textSecondary text-sm">
              ${item.usdValue.toFixed(2)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-background rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-border">
            <Text className="text-text text-xl font-bold">Select Token</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Text className="text-primary text-2xl">×</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="p-4">
            <TextInput
              className="bg-surface p-3 rounded-lg text-text"
              placeholder="Search by name or symbol"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Token List */}
          <FlatList
            data={filteredTokens}
            renderItem={renderToken}
            keyExtractor={(item) => item.address}
            ListEmptyComponent={
              <View className="items-center justify-center py-12">
                <Text className="text-textSecondary text-center">
                  {searchQuery ? 'No tokens found' : 'No tokens available'}
                </Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </View>
    </Modal>
  );
}

