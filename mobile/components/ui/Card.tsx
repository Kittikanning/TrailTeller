import React from "react"
import { View, StyleSheet, Text } from "react-native"

export const Card = ({ children, style }: { children: React.ReactNode; style?: any }) => <View style={[styles.card, style]}>{children}</View>

export const CardContent = ({ children }: { children: React.ReactNode }) => <View style={styles.content}>{children}</View>
export const CardHeader = ({ children }: { children: React.ReactNode }) => <View style={styles.header}>{children}</View>
export const CardTitle = ({ children }: { children: React.ReactNode }) => <Text style={styles.title}>{children}</Text>
export const CardDescription = ({ children }: { children: React.ReactNode }) => <Text style={styles.desc}>{children}</Text>

const styles = StyleSheet.create({
  card: { padding: 16, margin: 8, borderRadius: 8, backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  header: { marginBottom: 8 },
  title: { fontSize: 18, fontWeight: "bold" },
  desc: { fontSize: 14, color: "#666" },
  content: { marginTop: 8 },
})
