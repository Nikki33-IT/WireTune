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
            App.Log("MainWindow constructor start");
            InitializeComponent();
            Loaded += MainWindow_Loaded;
            Closing += MainWindow_Closing;
            App.Log("MainWindow constructor complete");
        }

        private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            App.Log("MainWindow_Loaded start");
            ApplyDarkTitleBar();
            LoadWindowIcon();

            try
            {
                await EnsureServerRunningAsync();
                App.Log("EnsureServerRunningAsync finished successfully");
                await InitializeWebViewAsync();
                App.Log("InitializeWebViewAsync finished successfully");
                loadingOverlay.Visibility = Visibility.Collapsed;
                App.Log("Loading overlay hidden");
            }
            catch (Exception ex)
            {
                App.Log($"[ERROR] Startup exception: {ex}");
                string msg = ex.Message;
                if (ex.ToString().Contains("WebView2"))
                {
                    msg = "Microsoft Edge WebView2 Runtime is required.\nPlease install WebView2 Runtime or launch using WireTune.bat.";
                }
                MessageBox.Show($"Failed to initialize WireTune:\n\n{msg}", "WireTune Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void LoadWindowIcon()
        {
            try
            {
                var iconUri = new Uri("pack://application:,,,/icon.ico", UriKind.RelativeOrAbsolute);
                Icon = System.Windows.Media.Imaging.BitmapFrame.Create(iconUri);
            }
            catch
            {
                // Graceful fallback: window uses executable's embedded icon
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
            App.Log($"EnsureServerRunning: isRunning={isRunning}");
            if (isRunning) return;

            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            if (!string.IsNullOrEmpty(Environment.ProcessPath))
            {
                string? pDir = Path.GetDirectoryName(Environment.ProcessPath);
                if (!string.IsNullOrEmpty(pDir)) appDir = pDir;
            }

            string serverScript = Path.Combine(appDir, "src", "server.js");

            if (!File.Exists(serverScript))
            {
                string candidate = Path.GetFullPath(Path.Combine(appDir, "..", "..", "..", "..", "src", "server.js"));
                if (File.Exists(candidate))
                {
                    serverScript = candidate;
                }
            }

            App.Log($"EnsureServerRunning: serverScript exists={File.Exists(serverScript)}");

            if (!File.Exists(serverScript))
            {
                throw new FileNotFoundException("Cannot locate server.js. Please run WireTune from the application directory.");
            }

            string workingDir = Path.GetDirectoryName(Path.GetDirectoryName(serverScript)!)!;
            string nodeExe = FindNodeExecutable();
            App.Log($"EnsureServerRunning: nodeExe resolved, workingDir resolved");

            var psi = new ProcessStartInfo
            {
                FileName = nodeExe,
                Arguments = $"\"{serverScript}\"",
                WorkingDirectory = workingDir,
                UseShellExecute = false,
                CreateNoWindow = true,
                WindowStyle = ProcessWindowStyle.Hidden,
                RedirectStandardError = true,
                RedirectStandardOutput = true
            };

            var errSb = new System.Text.StringBuilder();

            try
            {
                _serverProcess = new Process { StartInfo = psi };
                _serverProcess.ErrorDataReceived += (s, e) =>
                {
                    if (e.Data != null) errSb.AppendLine(e.Data);
                };
                _serverProcess.Start();
                _serverProcess.BeginErrorReadLine();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Could not start backend server via '{nodeExe}' ({ex.Message}). Ensure Node.js is installed on your system.", ex);
            }

            // Wait up to 10 seconds for server to respond
            for (int i = 0; i < 50; i++)
            {
                await Task.Delay(200);
                if (await IsServerAliveAsync())
                {
                    return;
                }
                if (_serverProcess.HasExited)
                {
                    string errDetails = errSb.ToString().Trim();
                    if (string.IsNullOrEmpty(errDetails)) errDetails = $"Process exited with code {_serverProcess.ExitCode}.";
                    throw new InvalidOperationException($"Backend server failed to start: {errDetails}");
                }
            }

            throw new TimeoutException($"WireTune backend server did not respond on port {_port} within 10 seconds.");
        }

        private static string FindNodeExecutable()
        {
            string[] commonPaths = new[]
            {
                @"C:\node-js\node.exe",
                @"C:\Program Files\nodejs\node.exe",
                @"C:\Program Files (x86)\nodejs\node.exe",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "AppData", "Roaming", "nvm", "current", "node.exe")
            };

            foreach (var p in commonPaths)
            {
                if (File.Exists(p)) return p;
            }

            string? pathEnv = Environment.GetEnvironmentVariable("PATH");
            if (!string.IsNullOrEmpty(pathEnv))
            {
                foreach (var folder in pathEnv.Split(';', StringSplitOptions.RemoveEmptyEntries))
                {
                    try
                    {
                        string candidate = Path.Combine(folder.Trim(), "node.exe");
                        if (File.Exists(candidate)) return candidate;
                    }
                    catch { }
                }
            }

            return "node";
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
            App.Log("InitializeWebViewAsync: creating environment...");
            var env = await CoreWebView2Environment.CreateAsync(null, Path.Combine(Path.GetTempPath(), "WireTune_WebView2"));
            App.Log("InitializeWebViewAsync: EnsureCoreWebView2Async...");
            await webView.EnsureCoreWebView2Async(env);
            App.Log("InitializeWebViewAsync: CoreWebView2 initialized");

            webView.CoreWebView2.ProcessFailed += (s, ev) => App.Log($"[WebView2] ProcessFailed: {ev.ProcessFailedKind}, {ev.Reason}");
            webView.NavigationCompleted += (s, ev) => App.Log($"[WebView2] NavigationCompleted: success={ev.IsSuccess}, status={ev.WebErrorStatus}");
            webView.CoreWebView2.WindowCloseRequested += (s, ev) => App.Log("[WebView2] WindowCloseRequested");

            webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
            webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
            webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
            webView.CoreWebView2.Settings.IsZoomControlEnabled = false;

            App.Log($"InitializeWebViewAsync: navigating to http://127.0.0.1:{_port}/");
            webView.Source = new Uri($"http://127.0.0.1:{_port}/");
        }

        private void MainWindow_Closing(object? sender, System.ComponentModel.CancelEventArgs e)
        {
            App.Log($"MainWindow_Closing triggered, Cancel={e.Cancel}");
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
