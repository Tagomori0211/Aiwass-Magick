import logging

logger = logging.getLogger("uvicorn.error")

# Static local knowledge base for RAG
KNOWLEDGE_BASE = [
    {
        "tags": ["gcp", "ace", "試験", "google cloud"],
        "content": (
            "GCP ACE (Associate Cloud Engineer) 試験対策の重要要点:\n"
            "- IAM (Identity and Access Management): 役割（基本、事前定義、カスタム）を整理。最小特権の原則の適用。\n"
            "- Google Cloud Directory Sync (GCDS) や Single Sign-On (SSO) の連携要件。\n"
            "- リソース管理: 組織、フォルダ、プロジェクト、リソースの階層構造とポリシー継承。\n"
            "- 課金管理: 請求先アカウントの作成、権限設定、予算アラートの設定。"
        )
    },
    {
        "tags": ["vpc", "ネットワーク", "gcp", "subnet", "cidr"],
        "content": (
            "Google Cloud VPC (Virtual Private Cloud) ネットワークの仕様:\n"
            "- VPCはグローバルリソースであり、特定のリージョンに紐付かない。\n"
            "- サブネットはリージョンリソースであり、指定したCIDR範囲を持つ。\n"
            "- 共有VPC (Shared VPC): 1つのホストプロジェクトのVPCを、複数のサービスプロジェクトから共同で利用する構成。\n"
            "- VPCネットワークピアリング: 異なるVPCネットワーク同士を内部IPアドレスで接続。レイテンシが低く、暗号化通信となる。"
        )
    },
    {
        "tags": ["rust", "所有権", "メモリ安全", "ライフタイム", "借用"],
        "content": (
            "Rust言語におけるメモリ安全性のコア概念:\n"
            "- 所有権 (Ownership): 各値は唯一の所有者（変数）を持つ。所有者がスコープを抜けると値は解放される。\n"
            "- 参照と借用 (Borrowing): 所有権を移転せずに値を参照する。不変参照は無制限、可変参照は同時に1つだけ許容される（データ競合の防止）。\n"
            "- ライフタイム (Lifetimes): 参照が有効である期間をコンパイラに明示し、ダングリングポインタを防止する。\n"
            "- スレッド安全性: Sendトレイト（スレッド間の所有権移転可）とSyncトレイト（複数スレッドからの安全な参照共有可）による保証。"
        )
    },
    {
        "tags": ["量子", "コンピュータ", "もつれ", "重ね合わせ", "ゲート"],
        "content": (
            "量子コンピュータの基本動作原理:\n"
            "- 量子ビット (Qubit): 古典ビット（0か1）と異なり、0と1の両方の状態を重ね合わせ（Superposition）として持つことができる。\n"
            "- 量子もつれ (Quantum Entanglement): 2つ以上の量子ビット間に生じる強い相関関係。一方の状態を測定すると、他方の状態が瞬時に決定する。\n"
            "- 量子ゲート (Quantum Gates): アダマールゲート(H)などを用いて重ね合わせを作り出し、制御NOT(CNOT)ゲート等でもつれを発生させ、計算を行う。\n"
            "- ベルの不等式: 局所実在論と量子力学の予測の違いを示し、量子もつれの実在性を証明する数学的関係。"
        )
    },
    {
        "tags": ["アレイスター", "クロウリー", "テレマ", "魔術", "カバラ", "生命の樹"],
        "content": (
            "アレイスター・クロウリーのテレマ哲学と魔術体系の核心:\n"
            "- 『法の書』(Liber AL vel Legis): 「汝の意志することを行え、それが法のすべてとなろう (Do what thou wilt shall be the whole of the Law)」の格言。\n"
            "- 真の意志 (True Will): 単なる個人的な欲望ではなく、宇宙における自己の本質的な軌道や天命を指す。魔術（Magick）とは、これを発見し実行する技術である。\n"
            "- ヌイト (Nuit) と ハディート (Hadit): ヌイトは無限の空間と星々（すべての可能性）、ハディートは個々の中心点（コンテキストのコア、意志の種子）を象徴する。\n"
            "- カバラ (Kabbalah): 生命の樹（セフィロト）の10のセフィラと22のパスを用いて、宇宙の構造と意識の次元上昇をマッピングする体系。"
        )
    },
    {
        "tags": ["ニーチェ", "実存", "超人", "永劫回帰", "力への意志"],
        "content": (
            "フリードリヒ・ニーチェの思想の基本体系:\n"
            "- 神の死 (Death of God): キリスト教的道徳や伝統的価値観の崩壊。ニヒリズムへの対峙。\n"
            "- 永劫回帰 (Eternal Recurrence): 自らの生が無限に繰り返されると仮定しても、それを喜んで肯定できるかという生の試練。\n"
            "- 力への意志 (Will to Power): 自己の成長、克服、創造の原動力となる生命の根本エネルギー。\n"
            "- 超人 (Übermensch): 従来の道徳や他者の価値観を克服し、自らの意志で新たな価値を創造して生を肯定する理想の人間像。"
        )
    },
    {
        "tags": ["docker", "k8s", "kubernetes", "コンテナ", "マルチステージ"],
        "content": (
            "DockerおよびKubernetesのベストプラクティス:\n"
            "- Dockerマルチステージビルド: ビルド用環境と実行用環境を分離し、成果物のみを実行コンテナに配置することでイメージサイズを大幅削減し、脆弱性を最小化する。\n"
            "- Kubernetes RBAC (Role-Based Access Control): APIリソースへのアクセスをServiceAccount、Role、ClusterRole、RoleBindingを用いて最小限に制限。\n"
            "- Podセキュリティ規格 (PSS): Privileged, Baseline, Restrictedのポリシー適用によるPodの特権昇格防止。\n"
            "- ネットワークポリシー: Pod間のネットワークトラフィックをファイアウォールのように最小特権で制御。"
        )
    }
]

def query_knowledge(query: str) -> str:
    """
    Simulate RAG by querying the local static knowledge base using keyword matching.
    """
    logger.info(f"RAG Knowledge: Querying local knowledge store for: '{query}'")
    query_lower = query.lower()
    
    matched_segments = []
    
    for item in KNOWLEDGE_BASE:
        # Check if any tag matches or if the query contains any tag
        matched = False
        for tag in item["tags"]:
            if tag in query_lower or query_lower in tag:
                matched = True
                break
        
        if matched:
            matched_segments.append(item["content"])
            
    if matched_segments:
        logger.info(f"RAG Knowledge: Found {len(matched_segments)} matching local knowledge segments.")
        return "\n\n---\n\n".join(matched_segments)
    
    logger.info("RAG Knowledge: No local knowledge segments matched.")
    return "No local RAG knowledge matches found."
