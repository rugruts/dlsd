/**
 * NetworkSettings Component
 * Custom RPC network management
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useSettingsStore } from '../../state/settingsStore';
import {
  probeAllNetworks,
  getLatencyColor,
  formatLatency,
  isValidRpcUrl,
} from '../../services/networkService';

export function NetworkSettings() {
  const {
    networks,
    activeNetworkId,
    addNetwork,
    updateNetwork,
    removeNetwork,
    setActiveNetwork,
    setDefaultNetwork,
  } = useSettingsStore();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingNetworkId, setEditingNetworkId] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState('');
  const [networkUrl, setNetworkUrl] = useState('');
  const [probing, setProbing] = useState(false);

  useEffect(() => {
    // Probe networks on mount
    handleProbeAll();
  }, []);

  const handleProbeAll = async () => {
    setProbing(true);
    try {
      await probeAllNetworks();
    } catch (error) {
      console.error('Failed to probe networks:', error);
    } finally {
      setProbing(false);
    }
  };

  const handleAddNetwork = () => {
    if (!networkName.trim()) {
      Alert.alert('Error', 'Please enter a network name');
      return;
    }

    if (!isValidRpcUrl(networkUrl)) {
      Alert.alert('Error', 'Please enter a valid HTTPS URL');
      return;
    }

    try {
      addNetwork({ name: networkName.trim(), url: networkUrl.trim() });
      setAddModalVisible(false);
      setNetworkName('');
      setNetworkUrl('');
      Alert.alert('Success', 'Network added successfully');
      handleProbeAll();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add network');
    }
  };

  const handleEditNetwork = (id: string) => {
    const network = networks.find((n) => n.id === id);
    if (network) {
      setEditingNetworkId(id);
      setNetworkName(network.name);
      setNetworkUrl(network.url);
      setEditModalVisible(true);
    }
  };

  const handleSaveEdit = () => {
    if (!editingNetworkId) return;

    if (!networkName.trim()) {
      Alert.alert('Error', 'Please enter a network name');
      return;
    }

    if (!isValidRpcUrl(networkUrl)) {
      Alert.alert('Error', 'Please enter a valid HTTPS URL');
      return;
    }

    try {
      updateNetwork(editingNetworkId, {
        name: networkName.trim(),
        url: networkUrl.trim(),
      });
      setEditModalVisible(false);
      setEditingNetworkId(null);
      setNetworkName('');
      setNetworkUrl('');
      Alert.alert('Success', 'Network updated successfully');
      handleProbeAll();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update network');
    }
  };

  const handleRemoveNetwork = (id: string, name: string) => {
    Alert.alert(
      'Remove Network',
      `Are you sure you want to remove "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            try {
              removeNetwork(id);
              Alert.alert('Success', 'Network removed successfully');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to remove network');
            }
          },
        },
      ]
    );
  };

  const handleSetActive = (id: string) => {
    try {
      setActiveNetwork(id);
      Alert.alert('Success', 'Active network changed');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to set active network');
    }
  };

  const handleSetDefault = (id: string) => {
    try {
      setDefaultNetwork(id);
      Alert.alert('Success', 'Default network set');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to set default network');
    }
  };

  const getLatencyChipColor = (latencyMs?: number) => {
    const color = getLatencyColor(latencyMs);
    const colorMap = {
      success: 'bg-success',
      warning: 'bg-warning',
      error: 'bg-error',
      neutral: 'bg-text-secondary',
    };
    return colorMap[color];
  };

  return (
    <View className="p-4">
      {/* Header with Probe Button */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-text-primary text-base font-semibold">RPC Networks</Text>
        <TouchableOpacity
          onPress={handleProbeAll}
          disabled={probing}
          className="bg-card px-4 py-2 rounded-lg border border-border flex-row items-center"
        >
          {!probing && <Icon name="refresh-cw" size={14} color="#F26A2E" />}
          <Text className="text-accent text-sm font-semibold ml-1">
            {probing ? 'Probing...' : 'Test All'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Network List */}
      <View className="space-y-3 mb-4">
        {networks.map((network) => {
          const isActive = network.id === activeNetworkId;
          const latencyColor = getLatencyChipColor(network.latencyMs);

          return (
            <View
              key={network.id}
              className={`bg-card rounded-xl p-4 border ${
                isActive ? 'border-accent' : 'border-border'
              }`}
            >
              {/* Network Info */}
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-text-primary text-base font-semibold">
                      {network.name}
                    </Text>
                    {network.isDefault && (
                      <View className="bg-accent/20 px-2 py-0.5 rounded ml-2">
                        <Text className="text-accent text-xs font-semibold">Default</Text>
                      </View>
                    )}
                    {isActive && (
                      <View className="bg-accent px-2 py-0.5 rounded ml-2">
                        <Text className="text-white text-xs font-semibold">Active</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-text-secondary text-sm mt-1" numberOfLines={1}>
                    {network.url}
                  </Text>
                </View>

                {/* Latency Chip */}
                <View className={`${latencyColor} px-2 py-1 rounded ml-2`}>
                  <Text className="text-white text-xs font-semibold">
                    {formatLatency(network.latencyMs)}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row flex-wrap gap-2 mt-2">
                {!isActive && (
                  <TouchableOpacity
                    onPress={() => handleSetActive(network.id)}
                    className="bg-accent/10 px-3 py-1.5 rounded"
                  >
                    <Text className="text-accent text-xs font-semibold">Set Active</Text>
                  </TouchableOpacity>
                )}

                {!network.isDefault && (
                  <TouchableOpacity
                    onPress={() => handleSetDefault(network.id)}
                    className="bg-card px-3 py-1.5 rounded border border-border"
                  >
                    <Text className="text-text-primary text-xs font-semibold">Set Default</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => handleEditNetwork(network.id)}
                  className="bg-card px-3 py-1.5 rounded border border-border flex-row items-center"
                >
                  <Icon name="edit-2" size={12} color="#F4F3E9" />
                  <Text className="text-text-primary text-xs font-semibold ml-1">Edit</Text>
                </TouchableOpacity>

                {!network.isDefault && networks.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveNetwork(network.id, network.name)}
                    className="bg-error/10 px-3 py-1.5 rounded flex-row items-center"
                  >
                    <Icon name="trash-2" size={12} color="#E45757" />
                    <Text className="text-error text-xs font-semibold ml-1">Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Add Network Button */}
      <TouchableOpacity
        onPress={() => setAddModalVisible(true)}
        className="bg-accent py-4 rounded-xl items-center"
      >
        <Text className="text-white text-base font-semibold">+ Add RPC Network</Text>
      </TouchableOpacity>

      {/* Add Network Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-background rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-text-primary text-lg font-bold mb-4">Add RPC Network</Text>

            <Text className="text-text-secondary text-sm mb-2">Network Name</Text>
            <TextInput
              value={networkName}
              onChangeText={setNetworkName}
              placeholder="e.g., My Custom RPC"
              placeholderTextColor="#888"
              className="bg-card text-text-primary px-4 py-3 rounded-xl border border-border mb-4"
            />

            <Text className="text-text-secondary text-sm mb-2">RPC URL</Text>
            <TextInput
              value={networkUrl}
              onChangeText={setNetworkUrl}
              placeholder="https://..."
              placeholderTextColor="#888"
              className="bg-card text-text-primary px-4 py-3 rounded-xl border border-border mb-4"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => {
                  setAddModalVisible(false);
                  setNetworkName('');
                  setNetworkUrl('');
                }}
                className="flex-1 bg-card py-3 rounded-xl items-center border border-border"
              >
                <Text className="text-text-primary font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddNetwork}
                className="flex-1 bg-accent py-3 rounded-xl items-center"
              >
                <Text className="text-white font-semibold">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Network Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-background rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-text-primary text-lg font-bold mb-4">Edit RPC Network</Text>

            <Text className="text-text-secondary text-sm mb-2">Network Name</Text>
            <TextInput
              value={networkName}
              onChangeText={setNetworkName}
              placeholder="e.g., My Custom RPC"
              placeholderTextColor="#888"
              className="bg-card text-text-primary px-4 py-3 rounded-xl border border-border mb-4"
            />

            <Text className="text-text-secondary text-sm mb-2">RPC URL</Text>
            <TextInput
              value={networkUrl}
              onChangeText={setNetworkUrl}
              placeholder="https://..."
              placeholderTextColor="#888"
              className="bg-card text-text-primary px-4 py-3 rounded-xl border border-border mb-4"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => {
                  setEditModalVisible(false);
                  setEditingNetworkId(null);
                  setNetworkName('');
                  setNetworkUrl('');
                }}
                className="flex-1 bg-card py-3 rounded-xl items-center border border-border"
              >
                <Text className="text-text-primary font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveEdit}
                className="flex-1 bg-accent py-3 rounded-xl items-center"
              >
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

