import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { useStakingStore } from '../../state/stakingStore';
import { useWalletStore } from '../../state/walletStoreV2';
import { Button } from '../../components/Button';
import { gorToLamports, isValidPublicKey } from '../../utils/stake';

export default function StakeActionScreen() {
  const navigation = useAppNavigation();
  const { params } = useAppRoute<'StakeAction'>();
  const { mode, stakeAccount, votePubkey } = params;

  const { balance } = useWalletStore();
  const { overview } = useStakingStore();

  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedStakeAccount, setSelectedStakeAccount] = useState(stakeAccount || '');
  const [selectedValidator, setSelectedValidator] = useState(votePubkey || '');

  useEffect(() => {
    // Set default destination to user's wallet
    if (mode === 'withdraw') {
      // Would get user's public key from auth store
      setDestination('11111111111111111111111111111112'); // Placeholder
    }
  }, [mode]);

  const handleMaxAmount = () => {
    if (mode === 'delegate') {
      // Leave some for fees
      const maxAmount = Math.max(0, (balance ?? 0) - 0.01); // 0.01 GOR for fees
      setAmount(maxAmount.toString());
    } else if (mode === 'withdraw') {
      const account = overview?.accounts.find(acc => acc.pubkey === selectedStakeAccount);
      if (account) {
        setAmount((account.withdrawableLamports / 1e9).toString());
      }
    }
  };

  const handleSubmit = () => {
    // Validation
    if (mode === 'delegate' || mode === 'delegateExisting') {
      if (!selectedValidator) {
        Alert.alert('Error', 'Please select a validator');
        return;
      }
      if (!amount || parseFloat(amount) <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }
      if (gorToLamports(amount) > (balance ?? 0) * 1e9) {
        Alert.alert('Error', 'Insufficient balance');
        return;
      }
    }

    if (mode === 'withdraw') {
      if (!destination || !isValidPublicKey(destination)) {
        Alert.alert('Error', 'Please enter a valid destination address');
        return;
      }
      if (!amount || parseFloat(amount) <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }
    }

    if (mode === 'delegateExisting' || mode === 'deactivate' || mode === 'withdraw') {
      if (!selectedStakeAccount) {
        Alert.alert('Error', 'Please select a stake account');
        return;
      }
    }

    // Navigate to review
    navigation.navigate('StakeReview', {
      action: {
        type: mode,
        stakeAccountPubkey: selectedStakeAccount,
        votePubkey: selectedValidator,
        amountLamports: amount ? gorToLamports(amount) : undefined,
        destinationPubkey: destination,
      },
      stakeData: {
        amount,
        validator: selectedValidator,
        stakeAccount: selectedStakeAccount,
        destination,
      },
    });
  };

  const renderDelegateForm = () => (
    <View>
      <Text className="text-text text-lg font-semibold mb-4">Delegate Stake</Text>

      <View className="mb-4">
        <Text className="text-textSecondary mb-2">Amount (GOR)</Text>
        <View className="flex-row">
          <TextInput
            className="flex-1 bg-surface border border-gray-300 rounded-l-lg p-4 text-text"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity
            className="bg-gray-200 px-4 justify-center rounded-r-lg"
            onPress={handleMaxAmount}
          >
            <Text className="text-text font-semibold">MAX</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-textSecondary text-sm mt-1">
          Balance: {(balance ?? 0).toFixed(4)} GOR
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-textSecondary mb-2">Validator</Text>
        <TouchableOpacity
          className="bg-surface border border-gray-300 rounded-lg p-4"
          onPress={() => navigation.navigate('ValidatorList')}
        >
          <Text className="text-text">
            {selectedValidator ? `Validator ${selectedValidator.slice(0, 8)}...` : 'Select Validator'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWithdrawForm = () => (
    <View>
      <Text className="text-text text-lg font-semibold mb-4">Withdraw Stake</Text>

      <View className="mb-4">
        <Text className="text-textSecondary mb-2">Stake Account</Text>
        {/* Would be a picker for user's stake accounts */}
        <Text className="text-text bg-surface p-4 rounded-lg">
          {selectedStakeAccount ? `${selectedStakeAccount.slice(0, 8)}...` : 'Select Account'}
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-textSecondary mb-2">Amount (GOR)</Text>
        <View className="flex-row">
          <TextInput
            className="flex-1 bg-surface border border-gray-300 rounded-l-lg p-4 text-text"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity
            className="bg-gray-200 px-4 justify-center rounded-r-lg"
            onPress={handleMaxAmount}
          >
            <Text className="text-text font-semibold">MAX</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-textSecondary mb-2">Destination Address</Text>
        <TextInput
          className="bg-surface border border-gray-300 rounded-lg p-4 text-text"
          placeholder="Enter destination address"
          value={destination}
          onChangeText={setDestination}
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-text text-2xl font-bold">
            {mode === 'delegate' ? 'Stake GOR' :
             mode === 'delegateExisting' ? 'Delegate Stake' :
             mode === 'deactivate' ? 'Deactivate Stake' :
             'Withdraw Stake'}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-textSecondary text-lg">✕</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          {mode === 'delegate' && renderDelegateForm()}
          {mode === 'withdraw' && renderWithdrawForm()}
          {/* Other modes would have their own forms */}
        </View>

        <Button
          title="Review Transaction"
          onPress={handleSubmit}
          className="w-full mt-6"
        />
      </View>
    </SafeAreaView>
  );
}