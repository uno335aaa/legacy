from __future__ import annotations

import argparse
import json
from dataclasses import asdict

from analyzer.agents.ingestion_agent import IngestionAgent
from analyzer.parsers.factory import create_parser_for_file


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Analyzer stub. Use 'parse' for one file, 'index' for a whole project."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    parse_parser = subparsers.add_parser("parse", help="Parse one source file")
    parse_parser.add_argument("--file", required=True, help="Path to a source file")

    index_parser = subparsers.add_parser("index", help="Index files under a project directory")
    index_parser.add_argument("--root", required=True, help="Project root directory")

    args = parser.parse_args()

    if args.command == "parse":
        return run_parse(args.file)
    if args.command == "index":
        return run_index(args.root)
    return 1


def run_parse(file_path: str) -> int:
    language_parser = create_parser_for_file(file_path)
    if language_parser is None:
        print(json.dumps({"error": "Unsupported file type"}, ensure_ascii=False, indent=2))
        return 1

    result = language_parser.parse_file(file_path)
    print(json.dumps(asdict(result), ensure_ascii=False, indent=2))
    return 0


def run_index(root_dir: str) -> int:
    agent = IngestionAgent()
    result = agent.index_project(root_dir)
    print(json.dumps([asdict(item) for item in result], ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
