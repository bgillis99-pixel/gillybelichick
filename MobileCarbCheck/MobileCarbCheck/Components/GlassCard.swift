//
//  GlassCard.swift
//  Glassmorphism card component (Tesla style)
//

import SwiftUI

struct GlassCard<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        ZStack {
            // Blurred background with glassmorphism
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.teslaGray.opacity(0.5))
                .background(
                    .ultraThinMaterial,
                    in: RoundedRectangle(cornerRadius: 20)
                )

            // Subtle border glow (top-left highlight)
            RoundedRectangle(cornerRadius: 20)
                .stroke(
                    LinearGradient(
                        colors: [
                            Color.white.opacity(0.15),
                            Color.white.opacity(0.05),
                            Color.clear
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )

            // Content
            content
                .padding(20)
        }
    }
}

#Preview {
    ZStack {
        Color.teslaBlack.ignoresSafeArea()

        GlassCard {
            VStack {
                Text("Glass Card")
                    .font(.teslaHeadline)
                    .foregroundColor(.teslaWhite)

                Text("Tesla-inspired glassmorphism")
                    .font(.teslaCaption)
                    .foregroundColor(.teslaGrayText)
            }
        }
        .padding()
    }
}
