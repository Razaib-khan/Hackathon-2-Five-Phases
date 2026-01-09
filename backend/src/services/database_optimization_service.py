from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Dict, List
import logging


class DatabaseOptimizationService:
    @staticmethod
    def get_performance_insights(db: Session) -> Dict:
        """
        Get database performance insights
        """
        insights = {}

        # Check for missing indexes on commonly queried columns
        insights["missing_indexes"] = DatabaseOptimizationService._find_missing_indexes(db)

        # Check for slow queries
        insights["slow_queries"] = DatabaseOptimizationService._find_slow_queries(db)

        # Check table statistics
        insights["table_statistics"] = DatabaseOptimizationService._get_table_statistics(db)

        # Check for unused indexes
        insights["unused_indexes"] = DatabaseOptimizationService._find_unused_indexes(db)

        return insights

    @staticmethod
    def _find_missing_indexes(db: Session) -> List[Dict]:
        """
        Identify potentially missing indexes on commonly queried columns
        """
        # This is a simplified example - in a real system, you'd analyze query patterns
        # and identify missing indexes based on actual usage
        missing_indexes = []

        # Common patterns that typically need indexes
        potential_indexes = [
            {"table": "users", "column": "email", "reason": "Frequently queried for authentication"},
            {"table": "users", "column": "username", "reason": "Frequently queried for user lookup"},
            {"table": "submissions", "column": "team_id", "reason": "Frequently joined with teams"},
            {"table": "submissions", "column": "hackathon_id", "reason": "Frequently filtered by hackathon"},
            {"table": "teams", "column": "hackathon_id", "reason": "Frequently filtered by hackathon"},
            {"table": "notifications", "column": "user_id", "reason": "Frequently queried by user"},
            {"table": "notifications", "column": "is_read", "reason": "Frequently filtered by read status"},
            {"table": "evaluations", "column": "submission_id", "reason": "Frequently joined with submissions"},
            {"table": "evaluations", "column": "evaluator_id", "reason": "Frequently queried by evaluator"},
        ]

        for idx in potential_indexes:
            # Check if index exists (this is a simplified check)
            # In a real system, you'd query the database's information schema
            index_exists = DatabaseOptimizationService._check_index_exists(db, idx["table"], idx["column"])
            if not index_exists:
                missing_indexes.append(idx)

        return missing_indexes

    @staticmethod
    def _check_index_exists(db: Session, table_name: str, column_name: str) -> bool:
        """
        Check if an index exists for a given table and column
        """
        # This is a simplified check - in a real system, you'd query the database's information schema
        # For PostgreSQL, you would typically query pg_indexes or pg_class

        # For this implementation, we'll assume no indexes exist initially
        # so we can suggest them
        return False

    @staticmethod
    def _find_slow_queries(db: Session) -> List[Dict]:
        """
        Find potentially slow queries (in a real system, this would use pg_stat_statements or similar)
        """
        # This is a placeholder - in a real system, you'd analyze query performance stats
        return [
            {
                "query_pattern": "SELECT * FROM submissions WHERE hackathon_id = ?",
                "estimated_duration": "> 100ms",
                "recommendation": "Add index on hackathon_id column"
            },
            {
                "query_pattern": "SELECT * FROM notifications WHERE user_id = ? AND is_read = false",
                "estimated_duration": "> 50ms",
                "recommendation": "Add composite index on (user_id, is_read)"
            }
        ]

    @staticmethod
    def _get_table_statistics(db: Session) -> Dict:
        """
        Get basic table statistics
        """
        tables = ["users", "hackathons", "phases", "teams", "submissions", "evaluations", "notifications"]
        stats = {}

        for table in tables:
            try:
                result = db.execute(text(f"SELECT COUNT(*) as count FROM {table};"))
                row = result.fetchone()
                stats[table] = {"row_count": row[0] if row else 0}
            except Exception:
                stats[table] = {"row_count": "Unable to determine"}

        return stats

    @staticmethod
    def _find_unused_indexes(db: Session) -> List[Dict]:
        """
        Find potentially unused indexes
        """
        # Placeholder for unused index detection
        # In a real system, you'd use pg_stat_user_indexes in PostgreSQL
        return []

    @staticmethod
    def suggest_indexes(db: Session) -> List[Dict]:
        """
        Suggest indexes based on query patterns and usage
        """
        suggestions = [
            {
                "table": "users",
                "columns": ["email"],
                "type": "btree",
                "ddl": "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);",
                "benefit": "Improves authentication and user lookup performance"
            },
            {
                "table": "users",
                "columns": ["username"],
                "type": "btree",
                "ddl": "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);",
                "benefit": "Improves user lookup by username"
            },
            {
                "table": "submissions",
                "columns": ["hackathon_id"],
                "type": "btree",
                "ddl": "CREATE INDEX IF NOT EXISTS idx_submissions_hackathon_id ON submissions(hackathon_id);",
                "benefit": "Improves query performance when filtering submissions by hackathon"
            },
            {
                "table": "submissions",
                "columns": ["team_id"],
                "type": "btree",
                "ddl": "CREATE INDEX IF NOT EXISTS idx_submissions_team_id ON submissions(team_id);",
                "benefit": "Improves join performance with teams table"
            },
            {
                "table": "teams",
                "columns": ["hackathon_id"],
                "type": "btree",
                "ddl": "CREATE INDEX IF NOT EXISTS idx_teams_hackathon_id ON teams(hackathon_id);",
                "benefit": "Improves query performance when filtering teams by hackathon"
            },
            {
                "table": "notifications",
                "columns": ["user_id", "is_read"],
                "type": "btree",
                "ddl": "CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);",
                "benefit": "Improves performance for fetching unread notifications for a user"
            },
            {
                "table": "evaluations",
                "columns": ["submission_id"],
                "type": "btree",
                "ddl": "CREATE INDEX IF NOT EXISTS idx_evaluations_submission_id ON evaluations(submission_id);",
                "benefit": "Improves join performance with submissions table"
            },
            {
                "table": "evaluations",
                "columns": ["evaluator_id"],
                "type": "btree",
                "ddl": "CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator_id ON evaluations(evaluator_id);",
                "benefit": "Improves query performance when filtering evaluations by evaluator"
            }
        ]

        return suggestions

    @staticmethod
    def apply_suggested_indexes(db: Session) -> Dict:
        """
        Apply suggested indexes to the database
        """
        suggestions = DatabaseOptimizationService.suggest_indexes(db)
        results = {"applied": [], "failed": []}

        for suggestion in suggestions:
            try:
                db.execute(text(suggestion["ddl"]))
                db.commit()
                results["applied"].append(suggestion)
                logging.info(f"Applied index: {suggestion['ddl']}")
            except Exception as e:
                results["failed"].append({
                    "suggestion": suggestion,
                    "error": str(e)
                })
                logging.error(f"Failed to apply index: {suggestion['ddl']}, Error: {str(e)}")

        return results

    @staticmethod
    def get_query_optimization_tips(db: Session) -> List[str]:
        """
        Get general query optimization tips
        """
        return [
            "Use LIMIT clauses when retrieving large datasets",
            "Avoid SELECT *; specify only needed columns",
            "Use proper JOINs instead of multiple separate queries",
            "Consider using raw SQL for complex queries instead of ORM if performance is critical",
            "Use connection pooling to reuse database connections",
            "Implement caching for frequently accessed data",
            "Consider partitioning large tables by date or other logical divisions",
            "Use EXPLAIN ANALYZE to understand query execution plans"
        ]

    @staticmethod
    def run_vacuum_analyze(db: Session) -> str:
        """
        Run vacuum and analyze operations (PostgreSQL specific)
        """
        try:
            # Vacuum and analyze to update statistics and reclaim space
            db.execute(text("VACUUM ANALYZE;"))
            db.commit()
            return "Vacuum and analyze completed successfully"
        except Exception as e:
            logging.error(f"Error running vacuum analyze: {str(e)}")
            return f"Error running vacuum analyze: {str(e)}"