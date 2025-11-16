import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { useStakingStore } from '../../state/stakingStore';
import { Button } from '../../components/Button';
import { shortVoteKey, formatLamports } from '../../utils/stake';

export default function ValidatorListScreen() {
  const navigation = useAppNavigation();
  const { validators, loading } = useStakingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'commission' | 'stake' | 'name'>('commission');

  useEffect(() => {
    // Validators are loaded in the store
  }, []);

  const filteredValidators = validators
    .filter(validator =>
      validator.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      validator.votePubkey.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'commission':
          return a.commission - b.commission;
        case 'stake':
          return b.activatedStake - a.activatedStake;
        case 'name':
          return (a.name || a.votePubkey).localeCompare(b.name || b.votePubkey);
        default:
          return 0;
      }
    });

  const handleSelectValidator = (validator: any) => {
    navigation.navigate('StakeAction', {
      mode: 'delegate',
      votePubkey: validator.votePubkey,
    });
  };

  const renderValidatorItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-surface rounded-lg p-4 mb-2 mx-6"
      onPress={() => handleSelectValidator(item)}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-text font-semibold flex-1">
          {item.name || shortVoteKey(item.votePubkey)}
        </Text>
        <View className="flex-row items-center">
          {item.delinquent && (
            <Text className="text-red-500 text-xs mr-2">DELINQUENT</Text>
          )}
          <Text className="text-textSecondary text-sm">
            {item.commission / 10000}% commission
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-textSecondary text-sm">
          Vote Key: {shortVoteKey(item.votePubkey)}
        </Text>
        <Text className="text-textSecondary text-sm">
          {formatLamports(item.activatedStake)} GOR staked
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-text text-2xl font-bold">Select Validator</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-textSecondary text-lg">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TextInput
          className="bg-surface border border-gray-300 rounded-lg p-4 text-text mb-4"
          placeholder="Search validators..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Sort Options */}
        <View className="flex-row mb-4">
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg mr-2 ${sortBy === 'commission' ? 'bg-primary' : 'bg-surface'}`}
            onPress={() => setSortBy('commission')}
          >
            <Text className={sortBy === 'commission' ? 'text-white' : 'text-text'}>Commission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg mr-2 ${sortBy === 'stake' ? 'bg-primary' : 'bg-surface'}`}
            onPress={() => setSortBy('stake')}
          >
            <Text className={sortBy === 'stake' ? 'text-white' : 'text-text'}>Stake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${sortBy === 'name' ? 'bg-primary' : 'bg-surface'}`}
            onPress={() => setSortBy('name')}
          >
            <Text className={sortBy === 'name' ? 'text-white' : 'text-text'}>Name</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-text">Loading validators...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredValidators}
          renderItem={renderValidatorItem}
          keyExtractor={(item) => item.votePubkey}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}