import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native"

export default function LoginScreen({ onLogin, onNavigateToRegister }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = () => {
    if (email && password) {
      onLogin()
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.content}>
            {/* Logo & Branding */}
            <View style={styles.branding}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoIcon}>✈️</Text>
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>TrailTeller</Text>
                <Text style={styles.subtitle}>Your intelligent travel companion</Text>
              </View>
            </View>

            {/* Login Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
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
                    placeholder="••••••••"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity>
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.signInButton} onPress={handleSubmit}>
                <Text style={styles.signInButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View style={styles.registerSection}>
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>New to TrailTeller?</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity
                style={styles.createAccountButton}
                onPress={onNavigateToRegister}
              >
                <Text style={styles.createAccountButtonText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Decorative Elements */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={styles.footerIcon}>📍</Text>
            <Text style={styles.footerText}>Explore the world with confidence</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    minHeight: 600,
  },
  content: {
    width: "100%",
    maxWidth: 400,
  },
  branding: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 40,
  },
  titleContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 36,
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
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
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
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#007AFF",
  },
  signInButton: {
    height: 48,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  registerSection: {
    alignItems: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#666",
  },
  createAccountButton: {
    height: 48,
    width: "100%",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  createAccountButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
})