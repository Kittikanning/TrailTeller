import React from "react"
import { TouchableOpacity, Text, StyleSheet } from "react-native"

export const Button = ({ title, onPress, disabled }: { title: string; onPress?: () => void; disabled?: boolean }) => (
  <TouchableOpacity style={[styles.button, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  button: { backgroundColor: "#007AFF", padding: 12, borderRadius: 8, alignItems: "center" },
  text: { color: "#fff", fontWeight: "bold" },
  disabled: { opacity: 0.5 },
})
