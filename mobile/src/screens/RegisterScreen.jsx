import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native"

export default function RegisterScreen({ onRegister, onNavigateToLogin }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    onRegister()
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateToLogin} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Registration Form */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {/* Logo & Title */}
          <View style={styles.branding}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>✈️</Text>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Start planning your dream vacation</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                autoCapitalize="none"
                textContentType="none"
                autoCorrect={false}
                autoComplete="off"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
                autoCapitalize="none"
                textContentType="none"
                autoCorrect={false}
                autoComplete="off"
              />
            </View>

            <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
              <Text style={styles.createButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backArrow: {
    fontSize: 20,
    color: "#000",
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  branding: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 32,
  },
  titleContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
  },
  createButton: {
    height: 48,
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  termsContainer: {
    paddingHorizontal: 16,
  },
  termsText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
})