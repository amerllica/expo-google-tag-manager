import { SafeAreaView, Text } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>expo-google-tag-manager example</Text>
      <Text style={styles.body}>
        The config plugin copies the GTM containers from ./gtm into the native projects during
        prebuild. Log events with @react-native-firebase/analytics to reach GTM.
      </Text>
    </SafeAreaView>
  );
}

const styles = {
  container: { flex: 1, backgroundColor: '#eee' },
  header: { fontSize: 24, margin: 20 },
  body: { fontSize: 16, marginHorizontal: 20 },
};
