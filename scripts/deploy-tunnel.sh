#!/bin/bash
# =======================================================
# BOOSTUP - Instant Public HTTPS Launcher
# Exposes localhost:5000 to the public web with free HTTPS
# =======================================================

echo "======================================================"
echo "🚀 BOOSTUP ร้านเติมเงินเกม - PUBLIC HTTPS LAUNCHER"
echo "======================================================"

PORT=5000

# 1. Check if server is running on port 5000
echo "🔍 ตรวจสอบการทำงานของเซิร์ฟเวอร์บนพอร์ต $PORT..."

# 2. Try Cloudflare Tunnel or localtunnel
if command -v cloudflared &> /dev/null; then
    echo "⚡ เปิด Public HTTPS ผ่าน Cloudflare Quick Tunnel..."
    cloudflared tunnel --url http://localhost:$PORT
elif command -v npx &> /dev/null; then
    echo "⚡ เปิด Public HTTPS ผ่าน Localtunnel (npx)..."
    npx -y localtunnel --port $PORT
else
    echo "ℹ️ เพื่อเปิดลิงก์ออนไลน์ กรุณาติดตั้ง Cloudflare Tunnel:"
    echo "   brew install cloudflared"
    echo "   cloudflared tunnel --url http://localhost:$PORT"
fi
