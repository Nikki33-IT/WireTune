using System;
using System.Diagnostics;
using System.IO;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Interop;
using Microsoft.Web.WebView2.Core;

namespace WireTune
{
    public partial class MainWindow : Window
    {
        private const int DWMWA_USE_IMMERSIVE_DARK_MODE = 20;

        [DllImport("dwmapi.dll", PreserveSig = true)]
        private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);

        private Process? _serverProcess;
        private readonly int _port = 42880;
        private readonly HttpClient _http = new() { Timeout = TimeSpan.FromMilliseconds(500) };

        public MainWindow()
        {
            InitializeComponent();
            Loaded += MainWindow_Loaded;
            Closing += MainWindow_Closing;
        }

        private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            ApplyDarkTitleBar();

            try
            {
                await EnsureServerRunningAsync();
                await InitializeWebViewAsync();
                loadingOverlay.Visibility = Visibility.Collapsed;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to initialize WireTune: {ex.Message}", "WireTune Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void ApplyDarkTitleBar()
        {
            try
            {
                var handle = new WindowInteropHelper(this).Handle;
                int useDarkMode = 1;
                DwmSetWindowAttribute(handle, DWMWA_USE_IMMERSIVE_DARK_MODE, ref useDarkMode, sizeof(int));
            }
            catch
            {
                // Ignore if older OS doesn't support DWM attribute
            }
        }

        private async Task EnsureServerRunningAsync()
        {
            bool isRunning = await IsServerAliveAsync();
            if (isRunning) return;

            // Locate src/server.js relative to app directory
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string serverScript = Path.Combine(baseDir, "src", "server.js");

            // Check parent dirs if running from bin/Release/
            if (!File.Exists(serverScript))
            {
                string candidate = Path.GetFullPath(Path.Combine(baseDir, "..", "..", "..", "..", "src", "server.js"));
                if (File.Exists(candidate))
                {
                    serverScript = candidate;
                }
            }

            if (!File.Exists(serverScript))
            {
                throw new FileNotFoundException($"Cannot locate server.js at: {serverScript}");
            }

            string workingDir = Path.GetDirectoryName(Path.GetDirectoryName(serverScript)!)!;

            var psi = new ProcessStartInfo
            {
                FileName = "node",
                Arguments = $"\"{serverScript}\"",
                WorkingDirectory = workingDir,
                UseShellExecute = false,
                CreateNoWindow = true,
                WindowStyle = ProcessWindowStyle.Hidden
            };

            _serverProcess = Process.Start(psi);

            // Wait up to 5 seconds for server to respond
            for (int i = 0; i < 25; i++)
            {
                await Task.Delay(200);
                if (await IsServerAliveAsync())
                {
                    return;
                }
            }
        }

        private async Task<bool> IsServerAliveAsync()
        {
            try
            {
                var res = await _http.GetAsync($"http://127.0.0.1:{_port}/api/status");
                return res.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        private async Task InitializeWebViewAsync()
        {
            var env = await CoreWebView2Environment.CreateAsync(null, Path.Combine(Path.GetTempPath(), "WireTune_WebView2"));
            await webView.EnsureCoreWebView2Async(env);

            webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
            webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
            webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
            webView.CoreWebView2.Settings.IsZoomControlEnabled = false;

            webView.Source = new Uri($"http://127.0.0.1:{_port}/");
        }

        private void MainWindow_Closing(object? sender, System.ComponentModel.CancelEventArgs e)
        {
            try
            {
                if (_serverProcess != null && !_serverProcess.HasExited)
                {
                    _serverProcess.Kill(true);
                }
            }
            catch
            {
                // Clean exit
            }
        }
    }
}
