import React from "react"
import { Text, StyleSheet } from "react-native"

export const Label = ({ children }: { children: React.ReactNode }) => <Text style={styles.label}>{children}</Text>

const styles = StyleSheet.create({
  label: { fontWeight: "bold", marginBottom: 4 },
})
