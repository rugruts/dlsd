import { useNavigation as useNav, useRoute as useRt, NavigationProp, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/types/navigation';

export function useAppNavigation() {
  return useNav<NavigationProp<RootStackParamList>>();
}
export function useAppRoute<T extends keyof RootStackParamList>() {
  return useRt<RouteProp<RootStackParamList, T>>();
}