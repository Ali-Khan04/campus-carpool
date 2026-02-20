import { Pressable, Text } from "react-native";
import { router } from "expo-router";
import { authStyles } from "@/styles/authStyles";
import { Href } from "expo-router";

type Props = {
  label: string;
  href: Href;
};

export default function AuthFooterLink({ label, href }: Props) {
  return (
    <Pressable onPress={() => router.push(href)}>
      <Text style={authStyles.footerLink}>{label}</Text>
    </Pressable>
  );
}
