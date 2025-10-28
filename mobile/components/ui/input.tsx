import React from "react"
import { TextInput, StyleSheet } from "react-native"

export const Input = (props: any) => <TextInput style={styles.input} {...props} />

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 6 },
})
