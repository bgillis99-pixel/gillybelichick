//
//  MobileCarbCheckApp.swift
//  Mobile CARB Check
//
//  Tesla-inspired iOS app for mobile diesel testers
//

import SwiftUI

@main
struct MobileCarbCheckApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.dark) // Force dark mode (Tesla style)
        }
    }
}
