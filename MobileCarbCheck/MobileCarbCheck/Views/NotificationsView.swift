//
//  NotificationsView.swift
//  Notifications center
//

import SwiftUI

struct NotificationsView: View {
    var body: some View {
        ZStack {
            Color.teslaBlack.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Notifications")
                        .font(.teslaTitle)
                        .foregroundColor(.teslaWhite)
                        .padding(.horizontal)

                    Text("Stay updated with leads, payments, and activity")
                        .font(.teslaBody)
                        .foregroundColor(.teslaGrayText)
                        .padding(.horizontal)

                    // Notification cards
                    NotificationCard(
                        icon: "person.fill.badge.plus",
                        title: "New Lead",
                        subtitle: "Mike Johnson wants CARB test for 2020 Kenworth",
                        time: "5 min ago",
                        color: .teslaYellow
                    )

                    NotificationCard(
                        icon: "dollarsign.circle.fill",
                        title: "Payment Received",
                        subtitle: "$450 from Joe's Trucking",
                        time: "23 min ago",
                        color: .teslaGreen
                    )

                    NotificationCard(
                        icon: "doc.text.fill",
                        title: "Blog Ready",
                        subtitle: "Understanding CARB DPF Rules",
                        time: "2h ago",
                        color: .teslaBlue
                    )
                }
                .padding(.vertical)
            }
        }
    }
}

struct NotificationCard: View {
    let icon: String
    let title: String
    let subtitle: String
    let time: String
    let color: Color

    var body: some View {
        GlassCard {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.system(size: 28))
                    .foregroundColor(color)
                    .frame(width: 48, height: 48)
                    .background(color.opacity(0.2))
                    .cornerRadius(12)

                VStack(alignment: .leading, spacing: 6) {
                    Text(title)
                        .font(.teslaBody.weight(.semibold))
                        .foregroundColor(.teslaWhite)

                    Text(subtitle)
                        .font(.teslaCaption)
                        .foregroundColor(.teslaGrayText)
                        .lineLimit(2)

                    Text(time)
                        .font(.system(size: 11))
                        .foregroundColor(.teslaGrayText.opacity(0.7))
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundColor(.teslaGrayText)
            }
        }
        .padding(.horizontal)
    }
}

#Preview {
    NotificationsView()
}
