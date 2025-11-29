//
//  VINScannerView.swift
//  Tesla-style VIN scanner with camera
//

import SwiftUI
import AVFoundation
import Vision

struct VINScannerView: View {
    @Binding var isPresented: Bool
    @StateObject private var cameraService = CameraService()
    @State private var detectedVIN: String?
    @State private var isScanning = true
    @State private var showFlash = false

    var body: some View {
        ZStack {
            // Camera preview
            CameraPreviewView(session: cameraService.session)
                .ignoresSafeArea()

            // Dark overlay for better contrast
            Color.black.opacity(0.3)
                .ignoresSafeArea()

            // UI Overlay
            VStack {
                // Top bar
                HStack {
                    Button(action: { isPresented = false }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 36))
                            .foregroundColor(.teslaWhite)
                            .shadow(color: .black.opacity(0.5), radius: 10)
                    }

                    Spacer()

                    Button(action: { showFlash.toggle() }) {
                        Image(systemName: showFlash ? "bolt.circle.fill" : "bolt.slash.circle.fill")
                            .font(.system(size: 36))
                            .foregroundColor(showFlash ? .teslaYellow : .teslaWhite)
                            .shadow(color: .black.opacity(0.5), radius: 10)
                    }
                }
                .padding()

                Spacer()

                // Scanning frame
                ZStack {
                    // Main frame
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(
                            detectedVIN == nil ? Color.teslaBlue : Color.teslaGreen,
                            lineWidth: 4
                        )
                        .frame(width: 320, height: 140)
                        .shadow(color: (detectedVIN == nil ? Color.teslaBlue : Color.teslaGreen).opacity(0.5),
                               radius: 20)

                    // Corner brackets
                    VStack {
                        HStack {
                            CornerBracket()
                            Spacer()
                            CornerBracket()
                                .rotation3DEffect(.degrees(90), axis: (x: 0, y: 1, z: 0))
                        }
                        Spacer()
                        HStack {
                            CornerBracket()
                                .rotation3DEffect(.degrees(-90), axis: (x: 1, y: 0, z: 0))
                            Spacer()
                            CornerBracket()
                                .rotation3DEffect(.degrees(180), axis: (x: 0, y: 1, z: 0))
                        }
                    }
                    .frame(width: 320, height: 140)

                    // Scanning line animation
                    if detectedVIN == nil {
                        Rectangle()
                            .fill(
                                LinearGradient(
                                    colors: [
                                        Color.clear,
                                        Color.teslaBlue.opacity(0.8),
                                        Color.teslaBlue,
                                        Color.teslaBlue.opacity(0.8),
                                        Color.clear
                                    ],
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            )
                            .frame(width: 320, height: 3)
                            .offset(y: isScanning ? -70 : 70)
                            .animation(
                                .linear(duration: 2)
                                .repeatForever(autoreverses: true),
                                value: isScanning
                            )
                    }
                }

                Spacer()

                // Instruction or result
                if let vin = detectedVIN {
                    // Result card
                    GlassCard {
                        VStack(spacing: 16) {
                            HStack(spacing: 8) {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.system(size: 24))
                                    .foregroundColor(.teslaGreen)

                                Text("VIN Detected")
                                    .font(.teslaHeadline)
                                    .foregroundColor(.teslaWhite)
                            }

                            Text(vin)
                                .font(.teslaMonospace)
                                .foregroundColor(.teslaWhite)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 12)
                                .background(Color.teslaCharcoal)
                                .cornerRadius(8)

                            HStack(spacing: 12) {
                                Button(action: { detectedVIN = nil }) {
                                    Text("RETRY")
                                        .font(.teslaBody.weight(.semibold))
                                        .foregroundColor(.teslaWhite)
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(Color.teslaGray)
                                        .cornerRadius(12)
                                }

                                Button(action: {
                                    // Continue to next step
                                    isPresented = false
                                }) {
                                    Text("CONTINUE")
                                        .font(.teslaBody.weight(.semibold))
                                        .foregroundColor(.teslaBlack)
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(Color.teslaGreen)
                                        .cornerRadius(12)
                                }
                            }
                        }
                    }
                    .padding()
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                } else {
                    // Instructions
                    Text("Point camera at VIN plate")
                        .font(.teslaBody.weight(.medium))
                        .foregroundColor(.teslaWhite)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(
                            .ultraThinMaterial,
                            in: Capsule()
                        )
                        .shadow(color: .black.opacity(0.3), radius: 10)
                }

                Spacer()
                    .frame(height: 60)
            }
        }
        .onAppear {
            cameraService.checkPermissions()
            cameraService.startSession()
            isScanning = true

            // Simulate VIN detection after 3 seconds (for testing)
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                withAnimation(.spring(response: 0.5)) {
                    detectedVIN = "1FUJGLDR12LM12345"
                    HapticManager.shared.success()
                }
            }
        }
        .onDisappear {
            cameraService.stopSession()
        }
    }
}

// MARK: - Corner Bracket
struct CornerBracket: View {
    var body: some View {
        Path { path in
            path.move(to: CGPoint(x: 30, y: 0))
            path.addLine(to: CGPoint(x: 0, y: 0))
            path.addLine(to: CGPoint(x: 0, y: 30))
        }
        .stroke(Color.teslaWhite, lineWidth: 4)
        .frame(width: 30, height: 30)
    }
}

// MARK: - Camera Preview
struct CameraPreviewView: UIViewRepresentable {
    let session: AVCaptureSession

    func makeUIView(context: Context) -> UIView {
        let view = UIView(frame: .zero)
        view.backgroundColor = .black

        let previewLayer = AVCaptureVideoPreviewLayer(session: session)
        previewLayer.videoGravity = .resizeAspectFill
        view.layer.addSublayer(previewLayer)

        context.coordinator.previewLayer = previewLayer

        return view
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        if let previewLayer = context.coordinator.previewLayer {
            DispatchQueue.main.async {
                previewLayer.frame = uiView.bounds
            }
        }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    class Coordinator {
        var previewLayer: AVCaptureVideoPreviewLayer?
    }
}

#Preview {
    VINScannerView(isPresented: .constant(true))
}
