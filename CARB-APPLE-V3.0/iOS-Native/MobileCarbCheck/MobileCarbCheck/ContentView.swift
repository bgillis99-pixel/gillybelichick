//
//  ContentView.swift
//  Mobile CARB Check
//

import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    @State private var showScanner = false

    var body: some View {
        ZStack {
            // Main tab view
            TabView(selection: $selectedTab) {
                DashboardView(onStartTest: { showScanner = true })
                    .tabItem {
                        Label("Dashboard", systemImage: "gauge.with.dots.needle.67percent")
                    }
                    .tag(0)

                NotificationsView()
                    .tabItem {
                        Label("Notifications", systemImage: "bell.fill")
                    }
                    .tag(1)

                SettingsView()
                    .tabItem {
                        Label("Settings", systemImage: "gearshape.fill")
                    }
                    .tag(2)
            }
            .accentColor(.teslaBlue)
        }
        .fullScreenCover(isPresented: $showScanner) {
            VINScannerView(isPresented: $showScanner)
        }
    }
}

#Preview {
    ContentView()
}
