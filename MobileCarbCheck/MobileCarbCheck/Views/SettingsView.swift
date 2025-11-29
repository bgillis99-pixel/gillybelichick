//
//  SettingsView.swift
//  Settings screen
//

import SwiftUI

struct SettingsView: View {
    var body: some View {
        ZStack {
            Color.teslaBlack.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    Text("Settings")
                        .font(.teslaTitle)
                        .foregroundColor(.teslaWhite)
                        .padding(.horizontal)

                    // Profile Section
                    GlassCard {
                        HStack(spacing: 16) {
                            Circle()
                                .fill(Color.teslaBlue.opacity(0.3))
                                .frame(width: 60, height: 60)
                                .overlay(
                                    Image(systemName: "person.fill")
                                        .font(.system(size: 28))
                                        .foregroundColor(.teslaBlue)
                                )

                            VStack(alignment: .leading, spacing: 4) {
                                Text("Mobile Tester")
                                    .font(.teslaHeadline)
                                    .foregroundColor(.teslaWhite)

                                Text("info@carbcleantruckcheck.app")
                                    .font(.teslaCaption)
                                    .foregroundColor(.teslaGrayText)
                            }

                            Spacer()

                            Image(systemName: "chevron.right")
                                .foregroundColor(.teslaGrayText)
                        }
                    }
                    .padding(.horizontal)

                    // Settings Groups
                    VStack(spacing: 16) {
                        SettingsGroup(title: "GENERAL") {
                            SettingsRow(icon: "bell.fill", title: "Notifications", color: .teslaYellow)
                            SettingsRow(icon: "moon.fill", title: "Dark Mode", subtitle: "Always On", color: .teslaBlue)
                            SettingsRow(icon: "mic.fill", title: "Voice Input", color: .teslaGreen)
                        }

                        SettingsGroup(title: "BUSINESS") {
                            SettingsRow(icon: "creditcard.fill", title: "Billing", color: .teslaBlue)
                            SettingsRow(icon: "chart.bar.fill", title: "Analytics", color: .teslaGreen)
                            SettingsRow(icon: "doc.text.fill", title: "Reports", color: .teslaRed)
                        }

                        SettingsGroup(title: "SUPPORT") {
                            SettingsRow(icon: "questionmark.circle.fill", title: "Help Center", color: .teslaGrayText)
                            SettingsRow(icon: "envelope.fill", title: "Contact Us", color: .teslaGrayText)
                        }
                    }

                    // Version
                    Text("Version 1.0.0")
                        .font(.teslaCaption)
                        .foregroundColor(.teslaGrayText)
                        .frame(maxWidth: .infinity)
                        .padding(.top, 20)
                }
                .padding(.vertical)
            }
        }
    }
}

struct SettingsGroup<Content: View>: View {
    let title: String
    let content: Content

    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.teslaCaption)
                .foregroundColor(.teslaGrayText)
                .padding(.horizontal)

            GlassCard {
                VStack(spacing: 0) {
                    content
                }
            }
            .padding(.horizontal)
        }
    }
}

struct SettingsRow: View {
    let icon: String
    let title: String
    var subtitle: String? = nil
    let color: Color

    var body: some View {
        Button(action: {}) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(color)
                    .frame(width: 32)

                Text(title)
                    .font(.teslaBody)
                    .foregroundColor(.teslaWhite)

                Spacer()

                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.teslaCaption)
                        .foregroundColor(.teslaGrayText)
                }

                Image(systemName: "chevron.right")
                    .font(.teslaCaption)
                    .foregroundColor(.teslaGrayText)
            }
            .padding(.vertical, 8)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    SettingsView()
}
