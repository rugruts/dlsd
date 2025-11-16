import { RootStackParamList } from "./navigation";

declare global {
  namespace ReactNavigation {
    // Merge your RootStack into ReactNavigation types
    interface RootParamList extends RootStackParamList {}
  }
}