//
//  DashboardView.swift
//  Tesla-inspired dashboard
//

import SwiftUI

struct DashboardView: View {
    let onStartTest: () -> Void

    @State private var todayTests = 6
    @State private var revenue = 10350
    @State private var nextAppointment = "Joe's Trucking"
    @State private var appointmentTime = "2:00 PM"
    @State private var distanceAway = "5.2 mi"

    var body: some View {
        ZStack {
            // Background
            Color.teslaBlack
                .ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 24) {
                    // Header
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("MOBILE CARB CHECK")
                                .font(.teslaCaption)
                                .foregroundColor(.teslaGrayText)

                            Text("Dashboard")
                                .font(.teslaTitle)
                                .foregroundColor(.teslaWhite)
                        }

                        Spacer()

                        // Profile avatar
                        Circle()
                            .fill(Color.teslaBlue.opacity(0.3))
                            .frame(width: 48, height: 48)
                            .overlay(
                                Image(systemName: "person.fill")
                                    .foregroundColor(.teslaBlue)
                            )
                    }
                    .padding(.horizontal)
                    .padding(.top, 20)

                    // Hero Card - Next Appointment
                    GlassCard {
                        VStack(alignment: .leading, spacing: 16) {
                            HStack {
                                Text("NEXT TEST")
                                    .font(.teslaCaption)
                                    .foregroundColor(.teslaGrayText)

                                Spacer()

                                // Status indicator
                                HStack(spacing: 4) {
                                    Circle()
                                        .fill(Color.teslaGreen)
                                        .frame(width: 8, height: 8)

                                    Text("On Schedule")
                                        .font(.teslaCaption)
                                        .foregroundColor(.teslaGreen)
                                }
                            }

                            Text(nextAppointment)
                                .font(.teslaHeadline)
                                .foregroundColor(.teslaWhite)

                            HStack(spacing: 20) {
                                Label(appointmentTime, systemImage: "clock")
                                Label(distanceAway, systemImage: "location.fill")
                            }
                            .font(.teslaBody)
                            .foregroundColor(.teslaGrayText)

                            // Action buttons
                            HStack(spacing: 12) {
                                // Call button
                                Button(action: {}) {
                                    Image(systemName: "phone.fill")
                                        .font(.teslaBody)
                                        .foregroundColor(.teslaWhite)
                                        .frame(width: 50, height: 50)
                                        .background(Color.teslaCharcoal)
                                        .cornerRadius(12)
                                }

                                // Get Directions button
                                Button(action: {}) {
                                    HStack {
                                        Image(systemName: "arrow.triangle.turn.up.right.circle.fill")
                                        Text("GET DIRECTIONS")
                                            .font(.teslaBody.weight(.semibold))
                                    }
                                    .foregroundColor(.teslaBlack)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 50)
                                    .background(Color.teslaBlue)
                                    .cornerRadius(12)
                                }
                            }
                        }
                    }
                    .padding(.horizontal)

                    // Stats Row
                    HStack(spacing: 16) {
                        StatCard(
                            icon: "checkmark.circle.fill",
                            label: "TODAY",
                            value: "\(todayTests)",
                            color: .teslaGreen
                        )

                        StatCard(
                            icon: "dollarsign.circle.fill",
                            label: "REVENUE",
                            value: "$\(revenue)",
                            color: .teslaBlue
                        )
                    }
                    .padding(.horizontal)

                    // Quick Actions
                    GlassCard {
                        VStack(spacing: 0) {
                            QuickActionButton(
                                icon: "qrcode.viewfinder",
                                title: "Start New Test",
                                color: .teslaGreen,
                                action: onStartTest
                            )

                            Divider()
                                .background(Color.teslaGrayText.opacity(0.2))
                                .padding(.vertical, 8)

                            QuickActionButton(
                                icon: "message.fill",
                                title: "Messages",
                                badge: 3,
                                action: {}
                            )

                            Divider()
                                .background(Color.teslaGrayText.opacity(0.2))
                                .padding(.vertical, 8)

                            QuickActionButton(
                                icon: "bell.fill",
                                title: "Notifications",
                                badge: 2,
                                action: {}
                            )

                            Divider()
                                .background(Color.teslaGrayText.opacity(0.2))
                                .padding(.vertical, 8)

                            QuickActionButton(
                                icon: "calendar",
                                title: "Schedule",
                                action: {}
                            )
                        }
                    }
                    .padding(.horizontal)

                    // Recent Activity
                    VStack(alignment: .leading, spacing: 12) {
                        Text("RECENT ACTIVITY")
                            .font(.teslaCaption)
                            .foregroundColor(.teslaGrayText)
                            .padding(.horizontal)

                        GlassCard {
                            VStack(alignment: .leading, spacing: 16) {
                                ActivityRow(
                                    icon: "checkmark.circle.fill",
                                    title: "Test Completed",
                                    subtitle: "John Smith - PASSED",
                                    time: "2h ago",
                                    color: .teslaGreen
                                )

                                Divider()
                                    .background(Color.teslaGrayText.opacity(0.2))

                                ActivityRow(
                                    icon: "dollarsign.circle.fill",
                                    title: "Payment Received",
                                    subtitle: "$450.00",
                                    time: "3h ago",
                                    color: .teslaBlue
                                )

                                Divider()
                                    .background(Color.teslaGrayText.opacity(0.2))

                                ActivityRow(
                                    icon: "person.fill.badge.plus",
                                    title: "New Lead",
                                    subtitle: "Mike Johnson",
                                    time: "5h ago",
                                    color: .teslaYellow
                                )
                            }
                        }
                        .padding(.horizontal)
                    }

                    Spacer(minLength: 100)
                }
                .padding(.bottom, 40)
            }
        }
    }
}

// MARK: - Stat Card Component
struct StatCard: View {
    let icon: String
    let label: String
    let value: String
    var color: Color = .teslaBlue

    var body: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 28))
                    .foregroundColor(color)

                Text(label)
                    .font(.teslaCaption)
                    .foregroundColor(.teslaGrayText)

                Text(value)
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.teslaWhite)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

// MARK: - Quick Action Button
struct QuickActionButton: View {
    let icon: String
    let title: String
    var badge: Int? = nil
    var color: Color = .teslaBlue
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.system(size: 24))
                    .foregroundColor(color)
                    .frame(width: 32)

                Text(title)
                    .font(.teslaBody)
                    .foregroundColor(.teslaWhite)

                Spacer()

                if let badge = badge {
                    Text("\(badge)")
                        .font(.teslaCaption.weight(.bold))
                        .foregroundColor(.teslaBlack)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(color)
                        .cornerRadius(12)
                }

                Image(systemName: "chevron.right")
                    .font(.teslaCaption)
                    .foregroundColor(.teslaGrayText)
            }
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Activity Row
struct ActivityRow: View {
    let icon: String
    let title: String
    let subtitle: String
    let time: String
    let color: Color

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(color)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.teslaBody.weight(.medium))
                    .foregroundColor(.teslaWhite)

                Text(subtitle)
                    .font(.teslaCaption)
                    .foregroundColor(.teslaGrayText)
            }

            Spacer()

            Text(time)
                .font(.teslaCaption)
                .foregroundColor(.teslaGrayText)
        }
    }
}

#Preview {
    DashboardView(onStartTest: {})
}
