import { useNavigation as useNav, useRoute as useRt, NavigationProp, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';

export function useAppNavigation() {
  const navigation = useNav<NavigationProp<RootStackParamList>>();

  return {
    ...navigation,
    goBack: () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    },
    navigate: (name: any, params?: any) => {
      try {
        navigation.navigate(name, params);
      } catch (error) {
        console.warn('Navigation error:', error);
      }
    },
    popToTop: () => {
      try {
        (navigation as any).popToTop();
      } catch (error) {
        console.warn('Navigation error:', error);
      }
    },
    replace: (name: any, params?: any) => {
      try {
        (navigation as any).replace(name, params);
      } catch (error) {
        console.warn('Navigation error:', error);
      }
    },
  };
}

export function useAppRoute<T extends keyof RootStackParamList>() {
  return useRt<RouteProp<RootStackParamList, T>>();
}